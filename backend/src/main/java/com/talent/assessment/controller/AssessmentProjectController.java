package com.talent.assessment.controller;

import com.talent.assessment.entity.AssessmentProject;
import com.talent.assessment.service.AssessmentProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@Slf4j
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssessmentProjectController {
    
    private final AssessmentProjectService projectService;
    
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody AssessmentProject project) {
        try {
            AssessmentProject created = projectService.createProject(project);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            log.error("创建项目失败", e);
            return ResponseEntity.badRequest().body(createErrorResponse("创建项目失败: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProject(@PathVariable Long projectId) {
        try {
            AssessmentProject project = projectService.getProjectById(projectId);
            return ResponseEntity.ok(project);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("获取项目失败: " + e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllProjects() {
        try {
            List<AssessmentProject> projects = projectService.getAllProjects();
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("获取项目列表失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable Long projectId, @RequestBody AssessmentProject project) {
        try {
            AssessmentProject updated = projectService.updateProject(projectId, project);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("更新项目失败: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId) {
        try {
            projectService.deleteProject(projectId);
            return ResponseEntity.ok(createSuccessResponse("项目删除成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("删除项目失败: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{projectId}/status")
    public ResponseEntity<?> updateProjectStatus(@PathVariable Long projectId, @RequestParam Integer status) {
        try {
            AssessmentProject updated = projectService.updateProjectStatus(projectId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("更新项目状态失败: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
    
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}
