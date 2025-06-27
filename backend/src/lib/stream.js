// const { StreamChat } = require('stream-chat');
// require('dotenv').config();

// const apiKey = process.env.STREAM_API_KEY;
// const apiSecret = process.env.STREAM_API_SECRET;

// if (!apiKey || !apiSecret) {
//     console.log("stream api key or secret not found");
//     throw new Error('STREAM_API_KEY and STREAM_API_SECRET must be set in the environment variables');
// }

// const client = StreamChat.getInstance(apiKey, apiSecret);

// const upsertStreamUser = async (userData) => {
//     try {
//         await client.upsertUser(userData);
//         return userData;
//     } catch (error) {
//         console.error('Error creating/updating Stream user:', error);
//     }
// };
// const generateStreamToken = (userId) => {
//     try {
//        const userIdStr = userId.toString();
//         return client.createToken(userIdStr);
//     } catch (error) {
//         console.error('Error generating Stream token:', error);
//         return null;
//     }
// }

// module.exports = { upsertStreamUser, generateStreamToken };
