import React, { useState } from 'react';

const UploadFiles = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (selectedFile) {
      // 在这里处理文件上传逻辑
      console.log('选中的文件:', selectedFile.name);
    }
  };

  return (
    <div>占位</div>
  );
};

export default UploadFiles;
