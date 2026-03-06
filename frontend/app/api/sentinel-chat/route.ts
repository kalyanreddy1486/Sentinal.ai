import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, machineContext }: { messages: UIMessage[]; machineContext: Record<string, unknown> } = await req.json()

  const systemPrompt = `You are SENTINEL AI, an advanced industrial predictive maintenance AI copilot for PLANT-7 NORTH manufacturing facility. You analyze real-time sensor data and provide actionable maintenance insights.

Current machine context:
- Machine: ${machineContext.name} (${machineContext.type})
- Status: ${machineContext.status}
- Health Score: ${machineContext.health}%
- Failure Probability: ${machineContext.failureProbability}%
- Estimated Time to Failure: ${machineContext.timeToFailure}
- Temperature: ${machineContext.temperature}°C
- Vibration: ${machineContext.vibration} mm/s
- RPM: ${machineContext.rpm}
- Pressure: ${machineContext.pressure} bar

You are an expert in industrial machinery diagnostics, predictive maintenance, vibration analysis, thermal imaging, and failure mode analysis. Provide concise, technical, and actionable insights. Use industrial terminology. Keep responses under 150 words. Format key data points clearly.`

  const result = streamText({
    model: 'anthropic/claude-opus-4.6',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
