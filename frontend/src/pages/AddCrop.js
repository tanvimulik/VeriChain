import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import './Dashboard.css';

const categoryOptions = {
  Fruits: ['Mango', 'Banana', 'Apple', 'Orange', 'Grapes'],
  Vegetables: ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage'],
  Grains: ['Wheat', 'Rice', 'Corn', 'Barley'],
  Pulses: ['Lentils', 'Chickpeas', 'Kidney Beans'],
  Spices: ['Turmeric', 'Chili', 'Cumin', 'Coriander'],
  Others: [],
};

const stateOptions = ['Maharashtra', 'Karnataka', 'Gujarat', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Odisha'];

function AddCrop() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    cropName: '',
    category: '',
    subCategory: '',
    variety: '',
    isOrganic: false,
    qualityGrade: 'B',
    harvestDate: '',
    quantity: '',
    unit: 'Kg',
    minimumOrderQuantity: '',
    pricePerUnit: '',
    isPriceNegotiable: true,
    state: '',
    district: '',
    listingStatus: 'draft',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageFileChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(t('crop.invalidImage'));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('crop.imageSizeError'));
      return;
    }

    // Update files array
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...imagePreviews];
      newPreviews[index] = reader.result;
      setImagePreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const addImageField = () => {
    if (imageFiles.length < 5) {
      setImageFiles([...imageFiles, null]);
      setImagePreviews([...imagePreviews, null]);
    }
  };

  const removeImageField = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles.length > 0 ? newFiles : []);
    setImagePreviews(newPreviews.length > 0 ? newPreviews : []);
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (!file) continue;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.success) {
          // Use the relative URL from backend
          const imageUrl = response.data.imageUrl;
          // Convert to full URL for storage
          const fullUrl = `${window.location.origin}${imageUrl}`;
          uploadedUrls.push(fullUrl);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image ${i + 1}: ${error.response?.data?.message || error.message}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async (status) => {
    // Validation
    if (!formData.cropName || !formData.category || !formData.quantity || !formData.pricePerUnit) {
      alert(t('crop.fillRequired'));
      return;
    }

    if (!formData.state || !formData.district) {
      alert(t('crop.selectStateDistrict'));
      return;
    }

    setLoading(true);
    setUploadingImages(true);

    try {
      // Upload images first
      let cropImages = [];
      
      if (imageFiles.length > 0 && imageFiles.some(f => f !== null)) {
        try {
          cropImages = await uploadImages();
        } catch (error) {
          alert(error.message);
          setLoading(false);
          setUploadingImages(false);
          return;
        }
      }

      setUploadingImages(false);

      const submitData = { 
        ...formData, 
        listingStatus: status,
        cropImages: cropImages,
      };
      
      await api.post('/farmer/crops', submitData);
      const successMsg = status === 'draft' ? t('crop.savedDraft') : t('crop.published');
      alert(successMsg);
      navigate('/farmer-dashboard');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || t('crop.saveFailed')));
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>{t('crop.addCropTitle')}</h1>
        <button onClick={() => navigate('/farmer-dashboard')} className="btn-secondary">
          {t('crop.backToDashboard')}
        </button>
      </header>

      <div className="form-container">
        {/* Section 1: Basic Crop Details */}
        <div className="form-section">
          <h2>{t('crop.basicDetails')}</h2>
          
          <div className="form-group">
            <label>{t('crop.cropNameRequired')}</label>
            <input
              type="text"
              name="cropName"
              value={formData.cropName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('crop.categoryRequired')}</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">{t('crop.selectCategory')}</option>
              {Object.keys(categoryOptions).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {formData.category && categoryOptions[formData.category].length > 0 && (
            <div className="form-group">
              <label>{t('crop.subCategory')}</label>
              <select name="subCategory" value={formData.subCategory} onChange={handleChange}>
                <option value="">{t('crop.selectSubCategory')}</option>
                {categoryOptions[formData.category].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{t('crop.variety')}</label>
            <input type="text" name="variety" value={formData.variety} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isOrganic"
                checked={formData.isOrganic}
                onChange={handleChange}
              />
              {t('crop.organic')}
            </label>
          </div>

          <div className="form-group">
            <label>{t('crop.qualityGrade')}</label>
            <select name="qualityGrade" value={formData.qualityGrade} onChange={handleChange}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('crop.harvestDate')}</label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('crop.stateRequired')}</label>
            <select name="state" value={formData.state} onChange={handleChange} required>
              <option value="">{t('crop.selectState')}</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('crop.districtRequired')}</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder={t('crop.districtPlaceholder')}
              required
            />
          </div>
        </div>

        {/* Section 2: Crop Images */}
        <div className="form-section">
          <h2>{t('crop.cropImages')}</h2>
          <p className="info-text">{t('crop.cropImagesInfo')}</p>
          
          {imageFiles.map((file, index) => (
            <div key={index} className="form-group image-input-group">
              <label>{t('crop.image')} {index + 1}</label>
              <div className="input-with-button">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageFileChange(index, e)}
                  className="file-input"
                />
                {imageFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="btn-danger btn-small"
                  >
                    {t('crop.remove')}
                  </button>
                )}
              </div>
              {imagePreviews[index] && (
                <div className="image-preview">
                  <img src={imagePreviews[index]} alt={`Crop preview ${index + 1}`} />
                  <p className="image-name">{file?.name}</p>
                </div>
              )}
            </div>
          ))}
          
          {imageFiles.length === 0 && (
            <div className="form-group image-input-group">
              <label>{t('crop.image')} 1</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => handleImageFileChange(0, e)}
                className="file-input"
              />
            </div>
          )}
          
          {imageFiles.length < 5 && imageFiles.length > 0 && (
            <button
              type="button"
              onClick={addImageField}
              className="btn-secondary btn-small"
            >
              {t('crop.addAnotherImage')}
            </button>
          )}

          <div className="info-box">
            <p><strong>{t('crop.imageTipsTitle')}</strong></p>
            <ul>
              <li>{t('crop.imageTip1')}</li>
              <li>{t('crop.imageTip2')}</li>
              <li>{t('crop.imageTip3')}</li>
              <li>{t('crop.imageTip4')}</li>
              <li>{t('crop.imageTip5')}</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Quantity & Pricing */}
        <div className="form-section">
          <h2>{t('crop.quantityPricing')}</h2>
          
          <div className="form-group">
            <label>{t('crop.quantityRequired')}</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('crop.unit')}</label>
            <select name="unit" value={formData.unit} onChange={handleChange}>
              <option value="Kg">{t('crop.unitKg')}</option>
              <option value="Ton">{t('crop.unitTon')}</option>
              <option value="Quintal">{t('crop.unitQuintal')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('crop.minimumOrder')}</label>
            <input
              type="number"
              name="minimumOrderQuantity"
              value={formData.minimumOrderQuantity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('crop.priceRequired')}</label>
            <input
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isPriceNegotiable"
                checked={formData.isPriceNegotiable}
                onChange={handleChange}
              />
              {t('crop.priceNegotiable')}
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            onClick={() => handleSubmit('draft')}
            className="btn-secondary"
            disabled={loading || uploadingImages}
          >
            {uploadingImages ? t('crop.uploadingImages') : loading ? t('crop.saving') : t('crop.saveAsDraft')}
          </button>
          <button
            onClick={() => handleSubmit('active')}
            className="btn-primary"
            disabled={loading || uploadingImages}
          >
            {uploadingImages ? t('crop.uploadingImages') : loading ? t('crop.publishing') : t('crop.publishListing')}
          </button>
        </div>
      </div>

      <style jsx>{`
        .image-input-group {
          margin-bottom: 20px;
        }
        
        .input-with-button {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .input-with-button input {
          flex: 1;
        }

        .file-input {
          padding: 10px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          cursor: pointer;
          background-color: #f9f9f9;
        }

        .file-input:hover {
          border-color: var(--primary-green);
          background-color: #f0f9f0;
        }
        
        .btn-small {
          padding: 8px 16px;
          font-size: 14px;
          white-space: nowrap;
        }
        
        .image-preview {
          margin-top: 10px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          background-color: #fafafa;
        }
        
        .image-preview img {
          max-width: 100%;
          max-height: 200px;
          border-radius: 4px;
          object-fit: cover;
        }

        .image-name {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
          word-break: break-all;
        }
        
        .info-text {
          color: #666;
          font-size: 14px;
          margin-bottom: 15px;
        }

        .info-box {
          background-color: #e8f5e9;
          border-left: 4px solid var(--primary-green);
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }

        .info-box p {
          margin: 0 0 10px 0;
          color: #2e7d32;
        }

        .info-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .info-box li {
          color: #555;
          margin: 5px 0;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default AddCrop;
