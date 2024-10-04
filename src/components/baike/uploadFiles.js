import React, { useState, useEffect } from 'react';
import '../../styles/uploadFiles.css';

const UploadFiles = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = JSON.parse(localStorage.getItem('user'));
    if (storedUsername) {
      setUsername(storedUsername?.username || '');
    }
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFile && username) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('username', username);

        const response = await fetch('http://127.0.0.1:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setUploadStatus('文件上传成功！');
        } else {
          setUploadStatus('文件上传失败，请重试。');
        }
      } catch (error) {
        console.error('上传文件时出错:', error);
        setUploadStatus('上传文件时出错，请重试。');
      }
    } else if (!username) {
      setUploadStatus('请先登录后再上传文件。');
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2 className="upload-title">上传文件</h2>
        <label className="file-input-label">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
          <span className="file-input-text">
            {selectedFile ? selectedFile.name : '选择文件'}
          </span>
        </label>
        <button
          onClick={handleSubmit}
          className="upload-button"
          disabled={!selectedFile}
        >
          上传
        </button>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default UploadFiles;
