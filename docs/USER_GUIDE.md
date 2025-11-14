# Mr.Dark AI Agent Platform - User Guide

**Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**Author:** Manus AI

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Core Features](#core-features)
4. [Advanced Features](#advanced-features)
5. [Tool Categories](#tool-categories)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

Mr.Dark AI Agent Platform is a comprehensive AI agent system that combines the capabilities of **GPT**, **Claude**, **Gemini**, **Cursor**, and **Manus** into a single, unified environment. The platform provides **158+ tools** across **20 categories**, enabling you to accomplish complex tasks through natural language conversations with AI.

### Key Capabilities

The platform offers four primary modes of operation:

**Multi-Model AI Support** allows you to leverage different AI models based on your needs. GPT-4 excels at complex reasoning and code generation, Claude provides strong analytical capabilities with large context windows, and Gemini offers efficient processing for general tasks. You can switch between models seamlessly within the same session.

**Comprehensive Tool Library** provides access to 158 specialized tools organized into 20 categories. These tools enable browser automation for web scraping and testing, code execution in Python, JavaScript, and Shell environments, file operations including reading, writing, and editing, web search across multiple sources, image generation and manipulation, document processing for PDF, Word, and Excel files, database operations with SQL support, and system utilities for time, calculations, and conversions.

**Advanced Orchestration** enables sophisticated workflows through task scheduling with cron expressions and intervals, parallel execution for running multiple tasks simultaneously, workflow orchestration with dependency management, and memory persistence for long-term context retention.

**Secure Execution** ensures safety through sandbox isolation where all code runs in isolated environments, resource quotas to prevent abuse, execution monitoring with detailed logs, and error handling with automatic retries.

---

## Getting Started

### First Steps

Begin by signing in to the platform using your Manus account. Navigate to the homepage and click **"Sign In to Get Started"**. After authentication, you will be redirected to the main interface.

### Creating Your First Session

Start a new conversation by clicking **"Start Chatting"** on the homepage. This creates a new session where you can interact with the AI agent. Each session maintains its own conversation history and context.

### Basic Interaction

Communicate with the AI using natural language. Simply type your request in the chat input and press Enter. The AI will understand your intent and execute appropriate tools automatically.

For example, you might say: *"Search for the latest news about artificial intelligence and summarize the top 3 articles"*. The AI will use the web search tool, retrieve articles, and provide a summary.

### Understanding Responses

The AI provides responses in several formats. **Text responses** appear as markdown-formatted messages with support for headings, lists, code blocks, and tables. **Tool executions** show detailed information about which tools were called and their results. **Streaming responses** display content in real-time as it's generated. **Error messages** provide clear explanations when something goes wrong.

---

## Core Features

### Chat Interface

The chat interface serves as your primary interaction point with the AI agent.

**Message Input** supports multi-line text with Shift+Enter for new lines, file attachments for images and documents, and markdown formatting in your messages.

**Conversation History** displays all messages in chronological order, shows tool executions with expandable details, supports message search and filtering, and allows exporting conversations for later reference.

**Model Selection** lets you choose between GPT-4 for complex tasks, Claude for analytical work, and Gemini for general purposes. You can switch models mid-conversation without losing context.

### Tool Execution Viewer

When the AI uses tools, you can see detailed execution information in the viewer panel.

**Browser Automation** shows live screenshots of web pages being automated, displays the DOM structure and element selectors, shows network requests and responses, and provides JavaScript console output.

**Code Execution** displays the code being executed, shows real-time output as it runs, captures error messages and stack traces, and shows execution time and resource usage.

**File Operations** lists files being read or written, shows file content with syntax highlighting, displays file metadata like size and permissions, and provides download links for generated files.

### Session Management

Manage your conversation sessions effectively through the Sessions page.

**Session List** shows all your sessions sorted by recency, displays session titles and creation dates, indicates session status (active, completed, failed), and allows quick access to any session.

**Session Actions** enable you to rename sessions for better organization, delete old sessions to free up space, export session data for backup, and share sessions with team members.

### Settings

Customize your experience through the Settings page.

**Profile Settings** let you update your display name, set your preferred language (Thai/English), configure notification preferences, and manage your API keys.

**Model Preferences** allow you to set your default AI model, configure temperature and creativity settings, set maximum token limits per request, and enable or disable specific tool categories.

**Quota Management** shows your monthly usage limits, displays current usage across all features, provides usage analytics and trends, and allows purchasing additional quota if needed.

---

## Advanced Features

### Task Scheduling

Automate recurring tasks by scheduling them to run at specific times or intervals.

**Creating a Schedule** involves navigating to the Advanced Features page, selecting the Scheduling tab, clicking "Create Scheduled Task", entering a task name and description, choosing between Cron expression or Interval, specifying when the task should run, and entering the prompt for the AI to execute.

**Cron Expressions** follow the format: `seconds minutes hours day-of-month month day-of-week`. For example, `0 0 9 * * *` runs every day at 9 AM, `0 0 12 * * 1-5` runs weekdays at noon, and `0 */15 * * * *` runs every 15 minutes.

**Interval Scheduling** uses simple second-based intervals. For instance, `3600` runs every hour, `86400` runs every day, and `604800` runs every week.

**Managing Schedules** allows you to view all scheduled tasks, pause or resume tasks, modify task parameters, and delete tasks you no longer need.

### Workflow Orchestration

Create multi-step workflows with dependencies between steps.

**Workflow Structure** consists of multiple steps that execute in order, dependencies that determine which steps must complete first, parallel execution for independent steps, and error handling with retry logic.

**Creating Workflows** through the API requires defining workflow steps with unique IDs, specifying dependencies between steps, setting retry policies for each step, and executing the workflow.

**Use Cases** include data processing pipelines that fetch, transform, and analyze data, report generation that collects data from multiple sources, automated testing that runs tests and generates reports, and content creation that researches, writes, and publishes content.

### Memory and Context

The platform maintains long-term memory across sessions to provide personalized experiences.

**Memory Types** include facts about information you've shared, preferences for your settings and choices, skills that the AI has learned about you, context from previous conversations, and summaries of important sessions.

**Automatic Learning** means the AI automatically stores important information, learns from your preferences and patterns, recalls relevant context in new conversations, and improves responses based on past interactions.

**Memory Management** lets you view all stored memories, search memories by keyword, update memory importance levels, and delete memories you don't want stored.

### Parallel Execution

Run multiple tasks simultaneously to save time and improve efficiency.

**Map Operations** apply the same operation to multiple inputs in parallel. For example, processing 100 URLs simultaneously or analyzing multiple documents at once.

**Batch Processing** automatically chunks large datasets, processes chunks in parallel, and aggregates results efficiently.

**Concurrency Control** limits the number of simultaneous executions, prevents resource exhaustion, and ensures fair usage across users.

---

## Tool Categories

The platform provides 158 tools organized into 20 categories.

### Browser Tools (7 tools)

**Navigate** opens web pages and follows links. **Click** interacts with page elements. **Type** fills in forms and inputs. **Screenshot** captures page visuals. **Extract** pulls data from pages. **Wait** pauses for page loading. **Evaluate** runs JavaScript in the browser.

### Code Tools (3 tools)

**Python Execution** runs Python scripts with full standard library access. **JavaScript Execution** executes Node.js code with npm packages. **Shell Execution** runs shell commands in a sandboxed environment.

### File Tools (15 tools)

Operations include reading, writing, editing, deleting, listing, copying, moving, renaming, searching, compressing, decompressing, uploading, downloading, and metadata retrieval.

### Search Tools (10 tools)

**Web Search** finds general information online. **Image Search** locates images by query. **News Search** retrieves current news articles. **Academic Search** finds research papers. **Video Search** locates video content. **Shopping Search** finds products and prices. **Local Search** finds nearby businesses. **Map Search** provides location data. **API Search** discovers available APIs. **Data Search** finds public datasets.

### AI Tools (8 tools)

**Text Generation** creates content from prompts. **Image Generation** creates images from descriptions. **Image Editing** modifies existing images. **Text-to-Speech** converts text to audio. **Speech-to-Text** transcribes audio to text. **Translation** converts between languages. **Sentiment Analysis** determines emotional tone. **Entity Extraction** identifies names, places, and organizations.

### Document Tools (12 tools)

**PDF Operations** include reading, creating, editing, merging, and splitting PDFs. **Word Operations** handle DOCX files. **Excel Operations** manage spreadsheets. **PowerPoint Operations** create and edit presentations. **Markdown Operations** process markdown files. **HTML Operations** generate and parse HTML. **CSV Operations** work with tabular data.

### System Tools (15 tools)

Utilities for time and date operations, calculations and math, unit conversions, random generation, encoding and decoding, hashing and encryption, UUID generation, QR code creation, barcode scanning, color conversion, regex operations, JSON parsing, XML processing, YAML handling, and environment variables.

### API Tools (10 tools)

**REST API** makes HTTP requests. **GraphQL** queries GraphQL endpoints. **WebSocket** establishes real-time connections. **SOAP** calls SOAP services. **gRPC** communicates via gRPC. **OAuth** handles authentication. **API Key Management** stores credentials. **Rate Limiting** controls request frequency. **Webhook** receives callbacks. **API Testing** validates endpoints.

### Git Tools (8 tools)

Version control operations including clone, commit, push, pull, branch, merge, diff, and log.

### Package Tools (6 tools)

**npm** manages Node.js packages. **pip** handles Python packages. **apt** installs system packages. **brew** manages macOS packages. **yarn** alternative Node.js package manager. **pnpm** efficient Node.js package manager.

### Database Tools (12 tools)

**SQL Query** executes SELECT statements. **SQL Insert** adds data. **SQL Update** modifies records. **SQL Delete** removes data. **SQL Create** defines schemas. **SQL Drop** removes tables. **MongoDB** operates on NoSQL data. **Redis** manages cache. **PostgreSQL** advanced SQL features. **MySQL** relational database operations. **SQLite** embedded database. **Database Backup** exports data.

### Monitoring Tools (8 tools)

**Log Analysis** parses application logs. **Metrics Collection** gathers performance data. **Alert Creation** sets up notifications. **Health Checks** monitors service status. **Performance Profiling** identifies bottlenecks. **Error Tracking** captures exceptions. **Uptime Monitoring** checks availability. **Resource Usage** tracks CPU and memory.

### Text Tools (15 tools)

String manipulation, case conversion, trimming, splitting, joining, replacing, searching, counting, sorting, reversing, padding, truncating, word wrapping, line breaking, and formatting.

### Data Tools (10 tools)

**JSON Operations** parse and stringify JSON. **CSV Operations** read and write CSV. **XML Operations** process XML data. **YAML Operations** handle YAML files. **Data Validation** checks data integrity. **Data Transformation** converts formats. **Data Filtering** selects subsets. **Data Aggregation** summarizes data. **Data Sorting** orders records. **Data Merging** combines datasets.

### Crypto Tools (8 tools)

**Encryption** secures data with AES, RSA. **Decryption** recovers encrypted data. **Hashing** creates SHA, MD5 hashes. **Signing** creates digital signatures. **Verification** validates signatures. **Key Generation** creates cryptographic keys. **Certificate Management** handles SSL certificates. **Random Generation** creates secure random values.

### Compression Tools (8 tools)

**ZIP** compresses and extracts ZIP files. **GZIP** handles GZIP compression. **TAR** creates and extracts tarballs. **RAR** works with RAR archives. **7Z** uses 7-Zip compression. **BZIP2** applies BZIP2 compression. **LZ4** fast compression. **ZSTD** modern compression algorithm.

### DateTime Tools (11 tools)

**Current Time** gets the current timestamp. **Format Date** converts date formats. **Parse Date** interprets date strings. **Add Time** performs date arithmetic. **Subtract Time** calculates time differences. **Compare Dates** determines which is earlier. **Timezone Conversion** changes timezones. **Calendar Operations** works with calendars. **Business Days** calculates working days. **Holiday Detection** identifies holidays. **Relative Time** formats human-readable durations.

### Network Tools (10 tools)

**Ping** tests connectivity. **DNS Lookup** resolves domain names. **Port Scan** checks open ports. **Traceroute** maps network paths. **IP Geolocation** finds IP locations. **WHOIS** queries domain information. **SSL Check** validates certificates. **Speed Test** measures bandwidth. **HTTP Headers** inspects headers. **URL Parse** breaks down URLs.

### Validation Tools (6 tools)

**Email Validation** checks email format. **URL Validation** verifies URL structure. **Phone Validation** validates phone numbers. **Credit Card Validation** checks card numbers. **IP Validation** verifies IP addresses. **JSON Schema Validation** validates against schemas.

### Math Tools (7 tools)

**Basic Operations** perform arithmetic. **Advanced Math** calculates trigonometry, logarithms. **Statistics** computes mean, median, mode. **Linear Algebra** works with matrices. **Calculus** performs derivatives, integrals. **Number Theory** handles prime numbers, factorization. **Random Numbers** generates random values.

---

## Best Practices

### Effective Prompting

Craft clear and specific prompts to get the best results from the AI agent.

**Be Specific** by stating exactly what you want, providing context and background information, specifying the desired output format, and mentioning any constraints or requirements.

**Provide Examples** by showing sample inputs and expected outputs, referencing similar tasks you've done before, and explaining what worked and what didn't in past attempts.

**Break Down Complex Tasks** by dividing large tasks into smaller steps, asking the AI to plan before executing, and reviewing intermediate results before proceeding.

**Use Structured Formats** by requesting tables for organized data, asking for JSON or CSV for machine-readable output, and specifying markdown for readable documents.

### Managing Resources

Use the platform efficiently to stay within quota limits.

**Monitor Usage** by checking your quota regularly, reviewing usage analytics, and identifying high-cost operations.

**Optimize Requests** by combining related tasks in one prompt, reusing results from previous executions, and caching frequently accessed data.

**Choose Appropriate Models** by using GPT-4 for complex reasoning, selecting Claude for long documents, and opting for Gemini for simple tasks.

### Security Considerations

Protect your data and maintain security best practices.

**API Keys** should never be shared in prompts, should be stored in the Settings page, and should be rotated regularly.

**Sensitive Data** should not include personal information in prompts, should use encryption for sensitive files, and should delete sessions containing confidential data.

**Access Control** should review who has access to your sessions, use private sessions for sensitive work, and enable two-factor authentication.

---

## Troubleshooting

### Common Issues

**Tool Execution Fails** may occur due to network timeouts, which can be resolved by retrying the operation or increasing timeout settings. Invalid parameters require checking the tool documentation and verifying input format. Resource limits mean you should check your quota usage and upgrade if needed.

**Slow Response Times** can result from high server load, so try again during off-peak hours. Complex operations benefit from breaking tasks into smaller steps. Large file processing should use streaming or chunking for large files.

**Unexpected Results** may stem from ambiguous prompts that need clarification and more specific instructions. Missing context requires providing more background information. Wrong model selection means choosing a more appropriate AI model for the task.

### Getting Help

**Documentation** provides this user guide for comprehensive information, API documentation for technical details, and video tutorials for visual learning.

**Support Channels** include the help center at https://help.manus.im, community forums for peer assistance, and email support for direct help.

**Feedback** encourages reporting bugs through the feedback form, suggesting features via the roadmap page, and sharing use cases to help improve the platform.

---

## Conclusion

Mr.Dark AI Agent Platform provides a powerful and flexible environment for accomplishing complex tasks through AI. By combining multiple AI models, comprehensive tools, and advanced orchestration capabilities, the platform enables you to automate workflows, process data, generate content, and solve problems efficiently.

Start exploring the platform today and discover how AI can enhance your productivity and capabilities.

---

**Document Version:** 1.0.0  
**Platform Version:** 1.0.0  
**Last Updated:** November 14, 2025  
**© 2025 Manus AI. All rights reserved.**
