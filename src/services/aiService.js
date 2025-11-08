import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Anthropic API key not found in environment variables');
    return null;
  }
  
  return new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

/**
 * Generate ultra-granular subtasks from a task description
 * Designed for executive dysfunction - breaks tasks into tiny, actionable steps
 */
export const generateSubtasks = async (taskDescription, granularity = 'detailed') => {
  const client = getAnthropicClient();
  
  if (!client) {
    // Fallback to mock data if API key is missing
    return generateMockSubtasks(taskDescription, granularity);
  }
  
  try {
    // Determine how many steps based on granularity
    const stepCounts = {
      'quick': '5-8',
      'detailed': '10-15',
      'very-detailed': '20-30'
    };
    
    const stepCount = stepCounts[granularity] || '10-15';
    
    const prompt = `You are helping someone with ADHD and executive dysfunction break down a task into ultra-granular, actionable steps.

CRITICAL REQUIREMENTS:
- Break the task into ${stepCount} EXTREMELY SMALL physical actions
- Include seemingly obvious steps like "stand up", "walk to location", "touch object"
- Each step should be a single, simple action that takes less than 1 minute
- Start with the absolute first physical movement needed
- Be literal and concrete - no abstract or vague steps
- Format: Return ONLY a JSON array of strings, nothing else

EXAMPLE:
Task: "Pack clothes from suitcase"
Good breakdown:
[
  "Stand up from current position",
  "Walk to where suitcase is located",
  "Reach down and touch the suitcase",
  "Unzip or open the suitcase",
  "Look at the clothes inside",
  "Pick up one piece of clothing",
  "Walk to the dresser/closet",
  "Open the drawer or closet door",
  "Place the clothing item inside",
  "Walk back to suitcase",
  "Pick up next piece of clothing",
  "Repeat until a few items are put away",
  "Take a break if needed"
]

Now break down this task:
"${taskDescription}"

Return ONLY the JSON array of step strings, no other text or formatting.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });
    
    // Extract the response text
    const responseText = message.content[0].text;
    
    // Parse the JSON array from the response
    let subtasks;
    try {
      // Try to parse directly
      subtasks = JSON.parse(responseText);
    } catch (e) {
      // If direct parse fails, try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        subtasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse subtasks from API response');
      }
    }
    
    // Validate that we got an array of strings
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      throw new Error('Invalid subtasks format from API');
    }
    
    return subtasks;
    
  } catch (error) {
    console.error('Error generating subtasks with AI:', error);
    // Fallback to mock data on error
    return generateMockSubtasks(taskDescription, granularity);
  }
};

/**
 * Mock subtask generator as fallback
 */
const generateMockSubtasks = (taskDescription, granularity) => {
  const stepCounts = {
    'quick': 5,
    'detailed': 10,
    'very-detailed': 20
  };
  
  const count = stepCounts[granularity] || 10;
  
  // Generic breakdown template
  const templates = [
    "Identify what needs to be done",
    "Gather necessary items or materials",
    "Clear the space where you'll work",
    "Take the first small action",
    "Complete one small part",
    "Check your progress",
    "Continue with the next part",
    "Take a short break if needed",
    "Resume and complete another part",
    "Finish the remaining steps",
    "Clean up or put things away",
    "Review what you accomplished",
    "Celebrate the completion"
  ];
  
  return templates.slice(0, count).map((step, index) => 
    `${step} for: ${taskDescription}`
  );
};

export default {
  generateSubtasks
};
