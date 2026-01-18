import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: imageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const FAL_API_KEY = Deno.env.get('FAL_API_KEY');
    if (!FAL_API_KEY) {
      console.error('FAL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== AUTENTICAÇÃO E CLIENTE ADMIN ==========
    // Criar cliente com SERVICE_ROLE para operações privilegiadas (INSERT, UPDATE)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obter usuário autenticado via token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log('Authenticated user:', userId);

    // Verificar créditos ANTES de qualquer processamento
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError || !subscription) {
      console.error('Subscription not found:', subError);
      return new Response(
        JSON.stringify({ error: 'Subscription not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const creditsRemaining = subscription.credits_total - subscription.credits_used;
    console.log('Credits check - Total:', subscription.credits_total, 'Used:', subscription.credits_used, 'Remaining:', creditsRemaining);

    if (creditsRemaining < 1) {
      return new Response(
        JSON.stringify({ error: 'No credits remaining' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== PROMPT PARA DESENHO DE COLORIR ==========
    const prompt = `Turn this image into a coloring page for a child. 

CRITICAL REQUIREMENTS:
- Create BLACK AND WHITE LINE ART ONLY
- Use CLEAN, BOLD OUTLINES suitable for coloring with crayons or markers
- NO filled colors, NO grayscale shading, NO gradients
- Simple, clear lines that a child can easily color inside
- Remove complex details that would be hard to color
- Make it FUN and APPEALING for children
- Keep the main subject recognizable but simplified
- Use thick, continuous lines for easy coloring
- Leave plenty of white space for coloring
- Style: Classic coloring book illustration

OUTPUT: A clean black and white coloring page with bold outlines, ready to be printed and colored by a child.`;

    console.log('=== COLORING PAGE GENERATION ===');
    console.log('User ID:', userId);
    console.log('Prompt:', prompt);
    console.log('================================');

    // ========== CHAMADA À API FAL.AI ==========
    const requestBody: {
      prompt: string;
      image_url: string;
      guidance_scale: number;
      num_images: number;
      output_format: string;
      width?: number;
      height?: number;
    } = {
      prompt: prompt,
      image_url: imageUrl,
      guidance_scale: 5.0,
      num_images: 1,
      output_format: 'jpeg',
      width: 1024,
      height: 1024,
    };

    const response = await fetch('https://queue.fal.run/fal-ai/flux-pro/kontext', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fal.ai API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate image', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Fal.ai response:', result);

    // Verificar se há request_id para pegar o resultado
    let finalResult = result;
    if (result.request_id && result.status_url && result.response_url) {
      // Usar os URLs fornecidos pela API
      const statusUrl = result.status_url;
      const responseUrl = result.response_url;
      let attempts = 0;
      const maxAttempts = 60; // 60 tentativas (5 minutos com 5s de intervalo)
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
        
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${FAL_API_KEY}`,
          },
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error('Status check error:', statusResponse.status, errorText);
          throw new Error(`Status check failed: ${errorText}`);
        }

        const statusText = await statusResponse.text();
        console.log('Status response text:', statusText);
        
        let statusResult;
        try {
          statusResult = JSON.parse(statusText);
        } catch (e) {
          console.error('Failed to parse status JSON:', statusText);
          throw new Error('Invalid JSON response from status endpoint');
        }
        
        console.log('Status check:', statusResult);

        if (statusResult.status === 'COMPLETED') {
          // Pegar o resultado final
          const resultResponse = await fetch(responseUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Key ${FAL_API_KEY}`,
            },
          });
          
          if (!resultResponse.ok) {
            const errorText = await resultResponse.text();
            console.error('Result fetch error:', resultResponse.status, errorText);
            throw new Error(`Failed to fetch result: ${errorText}`);
          }
          
          const resultText = await resultResponse.text();
          console.log('Result response text:', resultText);
          
          try {
            finalResult = JSON.parse(resultText);
          } catch (e) {
            console.error('Failed to parse result JSON:', resultText);
            throw new Error('Invalid JSON response from result endpoint');
          }
          break;
        } else if (statusResult.status === 'FAILED') {
          throw new Error('Image generation failed: ' + (statusResult.error || 'Unknown error'));
        }
        
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Image generation timeout');
      }
    }

    // Extrair URL da imagem gerada
    const generatedImageUrl = finalResult.images?.[0]?.url;
    
    console.log('Generated image URL:', generatedImageUrl);
    
    if (!generatedImageUrl) {
      console.error('No image URL in response:', finalResult);
      return new Response(
        JSON.stringify({ error: 'No image generated', details: finalResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========== SALVAR IMAGEM NO BANCO (com SERVICE_ROLE) ==========
    // Nota: Não salvamos o DataURL original (muito grande), apenas a URL gerada
    const { data: insertedImage, error: dbError } = await supabaseAdmin
      .from('generated_images')
      .insert({
        user_id: userId,
        original_image_url: generatedImageUrl,
        image_url: generatedImageUrl,
        config: { type: 'coloring-page' },
      })
      .select('id, image_url')
      .single();

    if (dbError) {
      console.error('Database error inserting image:', dbError);
    } else if (insertedImage) {
      console.log('Image saved to database:', insertedImage.id);
    }

    // ========== ATUALIZAR CRÉDITOS (com SERVICE_ROLE - CRÍTICO!) ==========
    const creditsToDeduct = 1;
    const newCreditsUsed = subscription.credits_used + creditsToDeduct;
    
    console.log('=== CREDIT UPDATE ===');
    console.log('Previous credits_used:', subscription.credits_used);
    console.log('Credits to deduct:', creditsToDeduct);
    console.log('New credits_used:', newCreditsUsed);
    
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('CRITICAL: Error updating credits:', updateError);
      // Mesmo com erro, a imagem já foi gerada, então retornamos sucesso
      // mas logamos o erro para investigação
    } else {
      console.log('Credits updated successfully! New credits_used:', newCreditsUsed);
    }
    console.log('=====================');

    const newCreditsRemaining = subscription.credits_total - newCreditsUsed;

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedImageUrl: generatedImageUrl,
        creditsUsed: creditsToDeduct,
        creditsRemaining: newCreditsRemaining
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-coloring-page function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
