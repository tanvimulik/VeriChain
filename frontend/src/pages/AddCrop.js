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
          const imageUrl = response.data.imageUrl;
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
    <div className="add-crop-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-seedling"></i>
            {t('crop.addCropTitle')}
          </h1>
          <button onClick={() => navigate('/farmer-dashboard')} className="btn-outline">
            <i className="fas fa-arrow-left"></i>
            {t('crop.backToDashboard')}
          </button>
        </div>
      </header>

      <div className="form-wrapper">
        <div className="form-progress">
          <div className="progress-steps">
            <div className="step active">
              <span className="step-number">1</span>
              <span className="step-label">Basic Details</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span className="step-label">Crop Images</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-label">Quantity & Price</span>
            </div>
          </div>
        </div>

        <form className="crop-form">
          {/* Section 1: Basic Crop Details */}
          <div className="form-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-info-circle"></i>
                {t('crop.basicDetails')}
              </h2>
              <p>Tell us about your crop</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>
                  {t('crop.cropNameRequired')} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="e.g., Organic Tomatoes"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {t('crop.categoryRequired')} <span className="required">*</span>
                </label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {Object.keys(categoryOptions).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.category && categoryOptions[formData.category].length > 0 && (
                <div className="form-group">
                  <label>{t('crop.subCategory')}</label>
                  <select name="subCategory" value={formData.subCategory} onChange={handleChange}>
                    <option value="">Select sub-category</option>
                    {categoryOptions[formData.category].map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>{t('crop.variety')}</label>
                <input 
                  type="text" 
                  name="variety" 
                  value={formData.variety} 
                  onChange={handleChange}
                  placeholder="e.g., Desi, Hybrid"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  {t('crop.organic')}
                </label>
              </div>

              <div className="form-group">
                <label>{t('crop.qualityGrade')}</label>
                <select name="qualityGrade" value={formData.qualityGrade} onChange={handleChange}>
                  <option value="A">Grade A - Premium</option>
                  <option value="B">Grade B - Good</option>
                  <option value="C">Grade C - Standard</option>
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
                <label>
                  {t('crop.stateRequired')} <span className="required">*</span>
                </label>
                <select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">Select state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  {t('crop.districtRequired')} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Crop Images */}
          <div className="form-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-images"></i>
                {t('crop.cropImages')}
              </h2>
              <p>Upload clear photos of your crop (Max 5 images)</p>
            </div>
            
            <div className="image-upload-grid">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="image-upload-card">
                  {imagePreviews[index] ? (
                    <div className="image-preview-wrapper">
                      <img src={imagePreviews[index]} alt={`Crop ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImageField(index)}
                        className="remove-image-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => handleImageFileChange(index, e)}
                        style={{ display: 'none' }}
                      />
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>Click to upload</span>
                      <small>JPEG, PNG up to 5MB</small>
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div className="image-tips">
              <h4>
                <i className="fas fa-lightbulb"></i>
                Tips for good photos:
              </h4>
              <ul>
                <li>Use natural lighting for better clarity</li>
                <li>Show the crop from multiple angles</li>
                <li>Include a scale/object for size reference</li>
                <li>Avoid blurry or dark images</li>
                <li>Show the freshness and quality</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Quantity & Pricing */}
          <div className="form-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-rupee-sign"></i>
                {t('crop.quantityPricing')}
              </h2>
              <p>Set quantity and pricing details</p>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>
                  {t('crop.quantityRequired')} <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('crop.unit')}</label>
                <select name="unit" value={formData.unit} onChange={handleChange}>
                  <option value="Kg">Kilogram (Kg)</option>
                  <option value="Quintal">Quintal</option>
                  <option value="Ton">Ton</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('crop.minimumOrder')}</label>
                <input
                  type="number"
                  name="minimumOrderQuantity"
                  value={formData.minimumOrderQuantity}
                  onChange={handleChange}
                  placeholder="Minimum order quantity"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>
                  {t('crop.priceRequired')} <span className="required">*</span>
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPriceNegotiable"
                    checked={formData.isPriceNegotiable}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  {t('crop.priceNegotiable')}
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="btn-secondary"
              disabled={loading || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Uploading...
                </>
              ) : loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {t('crop.saveAsDraft')}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('active')}
              className="btn-primary"
              disabled={loading || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Uploading...
                </>
              ) : loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle"></i>
                  {t('crop.publishListing')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .add-crop-page {
          background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .page-header {
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.8rem;
          color: #2E7D32;
          margin: 0;
        }

        .header-content h1 i {
          font-size: 2rem;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #2E7D32;
          color: #2E7D32;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: #2E7D32;
          color: white;
          transform: translateY(-2px);
        }

        .form-wrapper {
          max-width: 1000px;
          margin: 40px auto;
          padding: 0 30px;
        }

        /* Progress Steps */
        .form-progress {
          margin-bottom: 40px;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          position: relative;
          max-width: 600px;
          margin: 0 auto;
        }

        .progress-steps::before {
          content: '';
          position: absolute;
          top: 25px;
          left: 50px;
          right: 50px;
          height: 3px;
          background: #e0e0e0;
          z-index: 1;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: white;
          border: 3px solid #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          color: #999;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: #2E7D32;
          border-color: #2E7D32;
          color: white;
          box-shadow: 0 4px 12px rgba(46,125,50,0.3);
        }

        .step-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .step.active .step-label {
          color: #2E7D32;
          font-weight: 600;
        }

        /* Form Sections */
        .crop-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-section {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .form-section:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .section-header {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          color: #2E7D32;
          margin: 0 0 5px 0;
        }

        .section-header p {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          font-size: 0.95rem;
        }

        .required {
          color: #f44336;
          margin-left: 4px;
        }

        .form-group input,
        .form-group select {
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2E7D32;
          box-shadow: 0 0 0 4px rgba(46,125,50,0.1);
        }

        .form-group input::placeholder {
          color: #aaa;
        }

        /* Checkbox styling */
        .checkbox-group {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: 100%;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkbox-custom {
          width: 22px;
          height: 22px;
          border: 2px solid #2E7D32;
          border-radius: 6px;
          position: relative;
          transition: all 0.2s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
          background: #2E7D32;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
          content: '\\f00c';
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
          color: white;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
        }

        /* Image Upload Grid */
        .image-upload-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .image-upload-card {
          aspect-ratio: 1;
          background: #f8f9fa;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }

        .upload-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          border: 2px dashed #ccc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .upload-placeholder:hover {
          border-color: #2E7D32;
          background: #e8f5e8;
        }

        .upload-placeholder i {
          font-size: 2rem;
          color: #999;
        }

        .upload-placeholder span {
          font-size: 0.85rem;
          color: #666;
          text-align: center;
        }

        .upload-placeholder small {
          font-size: 0.7rem;
          color: #999;
        }

        .image-preview-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .image-preview-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 30px;
          height: 30px;
          background: rgba(244, 67, 54, 0.9);
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-image-btn:hover {
          background: #f44336;
          transform: scale(1.1);
        }

        .image-tips {
          background: #e8f5e8;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .image-tips h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2E7D32;
          margin: 0 0 10px 0;
          font-size: 1rem;
        }

        .image-tips ul {
          margin: 0;
          padding-left: 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .image-tips li {
          color: #555;
          font-size: 0.9rem;
        }

        /* Price Input */
        .price-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .currency-symbol {
          position: absolute;
          left: 15px;
          color: #666;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .price-input-wrapper input {
          padding-left: 35px;
          width: 100%;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 20px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 14px 35px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: #2E7D32;
          color: white;
          box-shadow: 0 4px 12px rgba(46,125,50,0.3);
        }

        .btn-primary:hover:not(:disabled) {
          background: #1B5E20;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(46,125,50,0.4);
        }

        .btn-secondary {
          background: white;
          color: #2E7D32;
          border: 2px solid #2E7D32;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e8f5e8;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .image-upload-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .image-tips ul {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .progress-steps::before {
            left: 30px;
            right: 30px;
          }
        }

        @media (max-width: 480px) {
          .form-wrapper {
            padding: 0 15px;
          }

          .form-section {
            padding: 20px;
          }

          .step-number {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .step-label {
            font-size: 0.8rem;
          }

          .image-upload-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default AddCrop;