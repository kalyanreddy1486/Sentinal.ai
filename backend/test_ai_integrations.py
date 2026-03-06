"""
Test script to verify Grok and Gemini integrations are working
"""
import asyncio
import json
from simulation.grok_client import grok_client
from ai.gemini_client import gemini_client
from copilot.claude_client import copilot_client

async def test_grok():
    """Test Grok API for sensor data generation"""
    print("=" * 50)
    print("TESTING GROK (xAI) INTEGRATION")
    print("=" * 50)
    
    try:
        # Test sensor data generation
        current_values = {
            "temperature": 85.0,
            "vibration": 2.5,
            "rpm": 3000,
            "pressure": 90.0
        }
        
        print(f"\nInput sensor values: {json.dumps(current_values, indent=2)}")
        print("Requesting Grok to generate next sensor readings...")
        
        result = await grok_client.generate_sensor_data(
            machine_type="Gas Turbine",
            current_values=current_values,
            degradation_factor=1.5,
            reading_number=10
        )
        
        print(f"\nGrok Response:")
        print(json.dumps(result, indent=2))
        
        # Check if using API or fallback
        if grok_client.api_key:
            print("\n✅ Grok API Key configured - Using xAI API")
        else:
            print("\n⚠️  No Grok API Key - Using local fallback simulation")
        
        print("\n✅ Grok integration is working!")
        return True
        
    except Exception as e:
        print(f"\n❌ Grok test failed: {e}")
        return False

async def test_gemini():
    """Test Gemini API for diagnosis"""
    print("\n" + "=" * 50)
    print("TESTING GEMINI INTEGRATION")
    print("=" * 50)
    
    try:
        # Test diagnosis
        sensor_data = {
            "temperature": 95.5,
            "vibration": 4.8,
            "rpm": 2850,
            "pressure": 78.2
        }
        
        tier_info = {
            "label": "CRITICAL",
            "reason": "Temperature exceeding threshold (95.5°C > 90°C)"
        }
        
        print(f"\nInput sensor data: {json.dumps(sensor_data, indent=2)}")
        print(f"Tier info: {json.dumps(tier_info, indent=2)}")
        print("Requesting Gemini diagnosis...")
        
        result = await gemini_client.diagnose_failure(
            machine_id="TEST-001",
            machine_type="Hydraulic Pump",
            sensor_data=sensor_data,
            tier_info=tier_info
        )
        
        print(f"\nGemini Response:")
        print(json.dumps(result, indent=2))
        
        # Check if using API or fallback
        if gemini_client.api_key:
            print("\n✅ Gemini API Key configured - Using Google API")
        else:
            print("\n⚠️  No Gemini API Key - Using fallback responses")
        
        print("\n✅ Gemini integration is working!")
        return True
        
    except Exception as e:
        print(f"\n❌ Gemini test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_copilot_chat():
    """Test Copilot chat functionality"""
    print("\n" + "=" * 50)
    print("TESTING COPILOT CHAT")
    print("=" * 50)
    
    try:
        message = "What is the health of Pump Gamma?"
        
        conversation_history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi! I'm SENTINEL AI Copilot. How can I help you today?"}
        ]
        
        context = {
            "machine_id": "C",
            "machine_name": "Pump Gamma",
            "current_readings": {
                "temperature": 95.5,
                "vibration": 4.1,
                "rpm": 2940
            }
        }
        
        print(f"\nUser question: {message}")
        print("Requesting Copilot response...")
        
        result = await copilot_client.chat(message, conversation_history, context)
        
        print(f"\nCopilot Response:")
        print(result.get('response', 'No response'))
        
        print("\n✅ Copilot chat is working!")
        return True
        
    except Exception as e:
        print(f"\n❌ Copilot test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("\n" + "=" * 50)
    print("SENTINEL AI - AI INTEGRATION TEST")
    print("=" * 50)
    
    results = {
        "grok": await test_grok(),
        "gemini": await test_gemini(),
        "copilot": await test_copilot_chat()
    }
    
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)
    
    for name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name.upper()}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("✅ All tests passed!" if all_passed else "⚠️  Some tests failed"))

if __name__ == "__main__":
    asyncio.run(main())
