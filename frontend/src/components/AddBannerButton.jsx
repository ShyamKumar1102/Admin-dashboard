import React, { useState } from 'react';

const AddBannerButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [position, setPosition] = useState('');
  const [active, setActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !position) {
      setError('Please fill all required fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Step 1: Get pre-signed URL
      const response = await fetch('http://localhost:5000/api/banners/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType: selectedFile.type })
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, publicUrl } = await response.json();

      // Step 2: Upload to S3
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
          title: title.trim(),
          bannerUrl: bannerUrl.trim(),
          position: Number(position),
          active
        })
      });

      if (!dbResponse.ok) {
        console.error('Failed to save to DynamoDB');
      }
      
      handleClose();
      alert('Banner uploaded successfully!');
      
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
    setTitle('');
    setBannerUrl('');
    setPosition('');
    setActive(true);
    setError('');
  };

  return (
    <>
      {/* Use your existing Button component */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="btn btn-primary" // Use your existing button classes
      >
        <i className="fas fa-plus"></i> Add Banner
      </button>

      {/* Use your existing Modal component */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'block', width: '100%' }}
                />
              </div>

              {previewUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Preview
                  </label>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Banner Text
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner text"
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Website URL
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Enter website URL (optional)"
                  className="form-input"
                  style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
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
                disabled={isUploading || !selectedFile || !title.trim() || !position}
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
    </>
  );
};

export default AddBannerButton;
