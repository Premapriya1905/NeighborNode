import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

async function testUpload() {
    try {
        const result = await cloudinary.uploader.upload('https://cloudinary-devs.github.io/cld-docs-assets/assets/images/butterfly.jpeg', {
            folder: 'neighbornode',
            resource_type: 'auto',
        });
        console.log('Success:', result.secure_url);
    } catch (error) {
        console.error('Cloudinary Error:', error);
    }
}

testUpload();
