package com.talent.assessment.service;

import com.talent.assessment.entity.AssessmentProject;
import com.talent.assessment.repository.AssessmentProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AssessmentProjectService {
    
    private final AssessmentProjectRepository projectRepository;
    
    public AssessmentProject createProject(AssessmentProject project) {
        project.setStatus(0); // 草稿状态
        return projectRepository.save(project);
    }
    
    public AssessmentProject getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("项目不存在"));
    }
    
    public List<AssessmentProject> getAllProjects() {
        return projectRepository.findAll();
    }
    
    public List<AssessmentProject> getProjectsByStatus(Integer status) {
        return projectRepository.findByStatus(status);
    }
    
    public AssessmentProject updateProject(Long projectId, AssessmentProject projectDetails) {
        AssessmentProject project = getProjectById(projectId);
        project.setProjectName(projectDetails.getProjectName());
        project.setDescription(projectDetails.getDescription());
        project.setProjectType(projectDetails.getProjectType());
        project.setTargetDepartmentIds(projectDetails.getTargetDepartmentIds());
        project.setTargetPositionIds(projectDetails.getTargetPositionIds());
        project.setStartDate(projectDetails.getStartDate());
        project.setEndDate(projectDetails.getEndDate());
        return projectRepository.save(project);
    }
    
    public void deleteProject(Long projectId) {
        AssessmentProject project = getProjectById(projectId);
        project.setStatus(3); // 已取消
        projectRepository.save(project);
    }
    
    public AssessmentProject updateProjectStatus(Long projectId, Integer status) {
        AssessmentProject project = getProjectById(projectId);
        project.setStatus(status);
        return projectRepository.save(project);
    }
}
