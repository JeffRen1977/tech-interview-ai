const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const codingQuestions = [
    {
        questionId: "max-consecutive-ones",
        title: "Maximum number of consecutive 1s",
        prompt: "Given a binary array, find the maximum number of consecutive 1s in this array.",
        example: "Input: [1,1,0,1,1,1], Output: 3"
    },
    {
        questionId: "binary-addition",
        title: "Binary addition",
        prompt: "Given two binary strings, return the sum of them (also a binary string).",
        example: "Input: a = \"11\", b = \"1\", Output: \"100\""
    },
    {
        questionId: "valid-parentheses",
        title: "Minimal removal to get valid parentheses",
        prompt: "Given a string s of parenthesis'(' and ')' alongside lowercase English characters, your task is to remove the minimum number of parentheses so that the resulting parentheses string is valid.",
        example: "Input: s = \"lee(t(c)o)de)\", Output: \"lee(t(c)o)de\""
    },
    {
        questionId: "lru-cache",
        title: "LRU Cache",
        prompt: "Design a Least Recently Used (LRU) Cache that supports get(key) and put(key, value) operations.",
        example: "After a series of puts and gets, the cache should evict the least recently used item when at capacity."
    },
    {
        questionId: "coin-change",
        title: "Coin Change",
        prompt: "Given coins of different denominations and a total amount, write a function to calculate the minimum number of coins needed to compose that total amount.",
        example: "Input: Coin = [1, 2, 5], Total Coin Value = 11, Output: 3"
    },
    {
        questionId: "clone-graph",
        title: "Clone graph",
        prompt: "Given a reference to a node in a connected undirected graph, return a deep copy (clone) of the graph.",
        example: "Each node in the graph contains a val (int) and a list (List[Node]) of its neighbors."
    }
];

const systemDesignQuestions = [
    { title: "Design a Web Crawler", prompt: "Design a scalable web crawler. How would you handle challenges like duplicate links, politeness, and determining when to update crawled results?" },
    { title: "Design TinyURL", prompt: "Design a URL shortening service like TinyURL. Discuss the core algorithm, API design, database schema, and strategies for scaling." },
    { title: "Design Autocomplete", prompt: "Design an autocomplete system. What data structure would you use? How would you rank suggestions and update the data in real-time?" },
    { title: "Design a Short Video Recommendation System", prompt: "Design a recommendation system for short videos (like YouTube Shorts or TikTok). Describe the high-level architecture, recommendation algorithms (e.g., collaborative, content-based), and metrics for success." },
    { title: "Design a Text-to-Image Generative AI System", prompt: "You are tasked with designing a text-to-image generation system similar to DALL·E or MidJourney. Discuss the model architecture, data pipeline, and real-time generation challenges." },
    { title: "Design ChatGPT", prompt: "Design a large language model like ChatGPT. Outline the steps for choosing the model architecture, gathering data, training, fine-tuning, and deployment." }
];

const behavioralQuestions = [
    { title: "Tell me about yourself", prompt: "Tell us a little about yourself." },
    { title: "Greatest Accomplishment", prompt: "Describe an accomplishment you're proud of." },
    { title: "Handling Technical Challenges", prompt: "Give an example of an interesting technical problem you've solved." },
    { title: "Interpersonal Challenges", prompt: "Tell me about a time you overcame an interpersonal challenge with a colleague." },
    { title: "Demonstrating Leadership", prompt: "Describe a situation where you showed leadership or ownership." },
    { title: "Handling Project Challenges", prompt: "Tell me about a project challenge and how you addressed it." }
];

function createSlug(title) {
    if (!title) return null;
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seedCollectionWithId(collectionName, dataArray, idField) {
    console.log(`Seeding collection: ${collectionName}...`);
    const collectionRef = db.collection(collectionName);
    const promises = [];

    for (const item of dataArray) {
        let docId = createSlug(item[idField]);
        if (!docId) {
            console.error(`Missing or invalid ID field '${idField}' in item:`, item);
            continue;
        }
        // For coding questions, use the specific questionId if available
        if (item.questionId) {
             docId = item.questionId;
        }
        promises.push(collectionRef.doc(docId).set(item));
    }

    await Promise.all(promises);
    console.log(`Successfully seeded ${dataArray.length} documents into ${collectionName}.`);
}

async function main() {
    try {
        await seedCollectionWithId('coding-questions', codingQuestions, 'questionId');
        await seedCollectionWithId('system-design-questions', systemDesignQuestions, 'title');
        await seedCollectionWithId('behavioral-questions', behavioralQuestions, 'title');
        console.log('\nDatabase seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

main();