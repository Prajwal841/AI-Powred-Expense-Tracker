package com.example.user.userservice.serviceimpl;

import com.example.user.userservice.exception.FileStorageException;
import com.example.user.userservice.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.file.max-size:10485760}") // 10MB default
    private long maxFileSize;

    @Value("${app.file.allowed-extensions:jpg,jpeg,png,pdf}")
    private String allowedExtensions;

    @Override
    public String storeFile(MultipartFile file, String directory) {
        log.info("Storing file: {} with size: {} bytes", file.getOriginalFilename(), file.getSize());

        // Validate file
        validateFile(file);

        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, directory);
            log.info("Upload path: {}", uploadPath.toAbsolutePath());
            
            if (!Files.exists(uploadPath)) {
                log.info("Creating directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
                log.info("Successfully created directory: {}", uploadPath);
            } else {
                log.info("Directory already exists: {}", uploadPath);
            }
            
            // Check if directory is writable
            if (!Files.isWritable(uploadPath)) {
                throw new FileStorageException("Upload directory is not writable: " + uploadPath);
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(fileExtension);
            
            Path filePath = uploadPath.resolve(uniqueFilename);
            log.info("Full file path: {}", filePath.toAbsolutePath());

            // Copy file to destination
            log.info("Copying file to destination...");
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File copied successfully");

            // Verify file was actually written
            if (!Files.exists(filePath)) {
                throw new FileStorageException("File was not created at expected location: " + filePath);
            }
            
            long fileSize = Files.size(filePath);
            log.info("File size on disk: {} bytes", fileSize);

            // Return relative path
            String relativePath = directory + "/" + uniqueFilename;
            log.info("File stored successfully at: {}", relativePath);
            
            return relativePath;

        } catch (IOException ex) {
            log.error("Failed to store file: {}", file.getOriginalFilename(), ex);
            throw new FileStorageException("Failed to store file: " + file.getOriginalFilename(), ex);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            log.warn("Attempted to delete file with null or empty path");
            return;
        }

        try {
            Path fullPath = Paths.get(uploadDir, filePath);
            if (Files.exists(fullPath)) {
                Files.delete(fullPath);
                log.info("File deleted successfully: {}", filePath);
            } else {
                log.warn("File not found for deletion: {}", filePath);
            }
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", filePath, ex);
            throw new FileStorageException("Failed to delete file: " + filePath, ex);
        }
    }

    @Override
    public boolean fileExists(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return false;
        }

        Path fullPath = Paths.get(uploadDir, filePath);
        boolean exists = Files.exists(fullPath);
        log.debug("File exists check for {}: {}", filePath, exists);
        return exists;
    }

    @Override
    public String getFileUrl(String filePath) {
        if (filePath == null || filePath.trim().isEmpty()) {
            return null;
        }

        // For local storage, return the complete URL
        // In production, this could return a CDN URL or cloud storage URL
        String url = "/api/user/files/" + filePath;
        log.debug("Generated file URL: {} for path: {}", url, filePath);
        return url;
    }

    // Helper methods
    private void validateFile(MultipartFile file) {
        log.info("Validating file: {} with size: {} bytes", 
            file.getOriginalFilename(), file.getSize());
            
        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new FileStorageException("File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new FileStorageException("File name is empty");
        }

        // Check file extension from filename
        String fileExtension = getFileExtension(originalFilename);
        if (!isAllowedExtension(fileExtension)) {
            log.warn("File extension '{}' not allowed. Allowed extensions: {}", fileExtension, allowedExtensions);
            throw new FileStorageException("File type not allowed. Allowed types: " + allowedExtensions);
        }
        
        // Also check content type if available
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            log.warn("Content type '{}' not allowed for file: {}", contentType, originalFilename);
            throw new FileStorageException("Invalid content type: " + contentType);
        }
        
        log.info("File validation passed for: {}", originalFilename);
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        if (extension == null || extension.trim().isEmpty()) {
            return false;
        }
        String[] allowed = allowedExtensions.split(",");
        for (String allowedExt : allowed) {
            if (allowedExt.trim().equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }

    private String generateUniqueFilename(String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + uuid + "." + extension;
    }
}
