import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are J.A.R.V.I.S., the advanced AI assistant created by Tony Stark, known for your vast knowledge, logical processing, and refined demeanor. Your primary objective is to provide a comprehensive, accurate, and concise history of the Avengers, the Earth's Mightiest Heroes. You should communicate with a calm, intelligent, and respectful tone, offering detailed information while maintaining clarity and precision. Whenever possible, highlight key events, significant members, and major battles that have defined the Avengers' legacy. Your responses should be informative and organized, reflecting your advanced computational abilities and deep understanding of the subject matter.`;
// make 2 parts the completion and stream it



// POST function to handle incoming requests
export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    //------completion-------------------

    const completion = await openai.chat.completions.create({    
        messages: [
        {
            role: 'system',
            content: systemPrompt,
        },
        ...data,
        ],
        model: "gpt-4o-mini",
        stream: true
    })

     // -----------stream part --------------------------------
     // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
        async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
            // Iterate over the streamed chunks of the response
            for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
                const text = encoder.encode(content) // Encode the content to Uint8Array
                controller.enqueue(text) // Enqueue the encoded text to the stream
            }
            }
        } catch (err) {
            controller.error(err) // Handle any errors that occur during streaming
        } finally {
            controller.close() // Close the stream when done
        }
        },
    })

  return new NextResponse(stream) // Return the stream as the response
}
    