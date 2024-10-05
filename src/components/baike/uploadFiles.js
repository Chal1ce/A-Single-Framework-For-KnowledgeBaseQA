import React, { useState, useEffect } from 'react';
import '../../styles/uploadFiles.css';

const UploadFiles = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [username, setUsername] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const storedUsername = JSON.parse(localStorage.getItem('user'));
    if (storedUsername) {
      setUsername(storedUsername?.username || '');
      fetchUploadedFiles(storedUsername?.username);
    }
  }, []);

  const fetchUploadedFiles = async (username) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/user_files/${username}`);
      if (response.ok) {
        const files = await response.json();
        setUploadedFiles(files);
      } else {
        console.error('获取用户文件列表失败');
      }
    } catch (error) {
      console.error('获取用户文件列表时出错:', error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length > 0 && username) {
      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('username', username);

        const response = await fetch('http://127.0.0.1:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setUploadStatus(result.message);
          setSelectedFiles([]);
          fetchUploadedFiles(username);
        } else {
          const errorData = await response.json();
          setUploadStatus(`上传失败：${errorData.detail}`);
        }
      } catch (error) {
        console.error('上传文件时出错:', error);
        setUploadStatus('上传文件时出错，请重试。');
      }
    } else if (!username) {
      setUploadStatus('请先登录后再上传文件。');
    } else {
      setUploadStatus('请选择至少一个文件上传。');
    }
  };

  const handleRefresh = () => {
    if (username) {
      fetchUploadedFiles(username);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (username) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/delete_file/${username}/${filename}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setUploadStatus('文件删除成功！');
          fetchUploadedFiles(username); // 重新获取文件列表
        } else {
          setUploadStatus('文件删除失败，请重试。');
        }
      } catch (error) {
        console.error('删除文件时出错:', error);
        setUploadStatus('删除文件时出错，请重试。');
      }
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
            multiple // 允许选择多个文件
          />
          <span className="file-input-text">
            {selectedFiles.length > 0
              ? `已选择 ${selectedFiles.length} 个文件`
              : '选择文件'}
          </span>
        </label>
        <button
          onClick={handleSubmit}
          className="upload-button"
          disabled={selectedFiles.length === 0}
        >
          上传
        </button>
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </div>
      <div className="uploaded-files">
        <div className="files-header">
          <h3>已上传的文件</h3>
          <button onClick={handleRefresh} className="refresh-button">
            刷新
          </button>
        </div>
        {uploadedFiles.length > 0 ? (
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                {file}
                <button
                  onClick={() => handleDeleteFile(file)}
                  className="delete-button"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>暂无上传文件</p>
        )}
      </div>
    </div>
  );
};

export default UploadFiles;
