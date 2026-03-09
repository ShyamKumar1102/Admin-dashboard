import React, { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../hooks/useToast';
import './pages.css';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bannerText, setBannerText] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [position, setPosition] = useState('');
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/banners/ads');
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Only image and video files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !bannerText.trim() || !position) {
      setError('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Step 1: Get pre-signed URL from backend
      const response = await fetch('http://localhost:5000/api/banners/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: selectedFile.type,
          bannerText: bannerText.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, publicUrl, fileName } = await response.json();

      // Step 2: Upload directly to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image');

      // Step 3: Save to DynamoDB
      const dbResponse = await fetch('http://localhost:5000/api/banners/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: publicUrl,
          title: bannerText.trim(),
          bannerUrl: bannerLink.trim(),
          position: Number(position),
          active
        })
      });

      if (!dbResponse.ok) throw new Error('Failed to save to database');

      // Reload banners from DB
      await loadBanners();
      handleClose();
      showToast('Banner uploaded successfully!', 'success');
      
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setBannerText('');
    setBannerLink('');
    setPosition('');
    setActive(true);
    setError('');
  };

  const handleDelete = async (bannerId) => {
    setConfirmDelete(bannerId);
  };

  const confirmDeleteBanner = async () => {
    const bannerId = confirmDelete;
    setConfirmDelete(null);
    
    const banner = banners.find(b => b.id === bannerId);
    
    try {
      // Extract fileName from imageUrl
      const fileName = banner.imageUrl.split('.com/')[1];
      
      // Delete from S3 and DynamoDB
      await fetch('http://localhost:5000/api/banners/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: fileName,
          id: banner.id
        })
      });
      
      // Reload banners from DB
      await loadBanners();
      showToast('Banner deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete banner', 'error');
    }
  };

  return (
    <div className="banners-page">
      <header className="page-header">
        <div>
          <h1><i className="fas fa-image"></i> Banner Management</h1>
          <p className="page-subtitle">Manage promotional banners and images</p>
        </div>
      </header>

      <div className="content">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card total">
              <span className="overview-icon"><i className="fas fa-images"></i></span>
              <div className="overview-content">
                <div className="overview-number">{banners.length}</div>
                <div className="overview-label">Total Banners</div>
              </div>
            </div>
          </div>
        </section>

        <section className="banners-section">
          <div className="section-header">
            <h2 className="section-title"><i className="fas fa-list"></i> Banner List</h2>
            <div className="section-controls">
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                <i className="fas fa-plus"></i> Add Banner
              </button>
            </div>
          </div>

          <div className="banners-grid">
            {banners.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-image"></i>
                <p>No banners yet. Click "Add Banner" to upload your first banner.</p>
              </div>
            ) : (
              banners.map(banner => (
                <div key={banner.id} className="banner-card">
                  <div className="banner-media">
                    {banner.imageUrl && (banner.imageUrl.includes('.mp4') || banner.imageUrl.includes('.webm') || banner.imageUrl.includes('.mov')) ? (
                      <video src={banner.imageUrl} controls />
                    ) : (
                      <img src={banner.imageUrl || ''} alt={banner.title || ''} />
                    )}
                  </div>
                  <div className="banner-info">
                    <h3>{banner.title}</h3>
                    {banner.bannerUrl && (
                      <a href={banner.bannerUrl} target="_blank" rel="noopener noreferrer" className="banner-link">
                        <i className="fas fa-link"></i> {banner.bannerUrl}
                      </a>
                    )}
                    <p className="banner-meta">
                      Position: {banner.position} | {banner.active ? 'Active' : 'Inactive'}
                    </p>
                    <button 
                      className="btn btn-danger btn-sm btn-block" 
                      onClick={() => handleDelete(banner.id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Add New Banner</h2>
              <button onClick={handleClose} className="close-btn">&times;</button>
            </div>

            <div className="modal-body">
              {error && (
                <div style={{ 
                  padding: '10px', 
                  marginBottom: '15px', 
                  backgroundColor: '#fee', 
                  color: '#c00', 
                  borderRadius: '4px' 
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Select Image or Video (Max 50MB)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'block', width: '100%' }}
                />
              </div>

              {previewUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Preview
                  </label>
                  {selectedFile?.type.startsWith('video/') ? (
                    <video 
                      src={previewUrl} 
                      controls
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }} 
                    />
                  ) : (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }} 
                    />
                  )}
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Banner Text
                </label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="Enter banner text"
                  className="form-input"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Banner Link (Optional)
                </label>
                <input
                  type="url"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="https://example.com"
                  className="form-input"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Position *
                </label>
                <input
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Enter position number"
                  className="form-input"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  min="1"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={handleClose} 
                className="btn btn-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                className="btn btn-primary"
                disabled={isUploading || !selectedFile || !bannerText.trim() || !position}
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload"></i> Upload Banner
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {confirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this banner? This action cannot be undone."
          onConfirm={confirmDeleteBanner}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default Banners;
