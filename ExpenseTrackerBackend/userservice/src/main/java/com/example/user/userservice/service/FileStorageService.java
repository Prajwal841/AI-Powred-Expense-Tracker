package com.example.user.userservice.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    
    String storeFile(MultipartFile file, String directory);
    
    void deleteFile(String filePath);
    
    boolean fileExists(String filePath);
    
    String getFileUrl(String filePath);
}
