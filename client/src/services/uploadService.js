import api from './api';

class UploadService {
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    return await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async uploadMultiple(files) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

export default new UploadService();