import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';
import superjson from 'superjson';

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
    }),
  ],
});

async function testAPI() {
  console.log('🧪 Testing Mr.Dark Platform API...\n');

  try {
    // Test 1: Get available tools
    console.log('✓ Test 1: Fetching available tools...');
    const tools = await client.agent.getTools.query();
    console.log(`  Found ${tools.length} tools`);
    console.log(`  Categories: ${[...new Set(tools.map(t => t.category))].join(', ')}\n`);

    // Test 2: Get tools by category
    console.log('✓ Test 2: Fetching browser tools...');
    const browserTools = await client.agent.getToolsByCategory.query({ category: 'browser' });
    console.log(`  Found ${browserTools.length} browser tools\n`);

    console.log('✅ All API tests passed!\n');
    console.log('📊 Summary:');
    console.log(`  - Total tools: ${tools.length}`);
    console.log(`  - Browser tools: ${browserTools.length}`);
    console.log(`  - API Status: Working ✓`);
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
