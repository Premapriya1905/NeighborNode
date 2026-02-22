import cloudinary from '../config/cloudinary.js';

class UploadService {
  async uploadImage(file, folder = 'neighbornode') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Image upload failed');
    }
  }

  async uploadMultipleImages(files, folder = 'neighbornode') {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }
}

export default new UploadService();