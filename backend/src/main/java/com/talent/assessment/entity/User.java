package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "real_name")
    private String realName;
    
    private String email;
    
    private String phone;
    
    @Column(name = "department_id")
    private Long departmentId;
    
    @Column(name = "position_id")
    private Long positionId;
    
    @Column(name = "employee_id")
    private String employeeId;
    
    private Integer status = 1;
    
    @Column(name = "last_login_time")
    private LocalDateTime lastLoginTime;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// ============================================

package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "departments")
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "dept_name", nullable = false)
    private String deptName;
    
    @Column(name = "dept_code", nullable = false, unique = true)
    private String deptCode;
    
    @Column(name = "parent_id")
    private Long parentId = 0L;
    
    @Column(name = "manager_id")
    private Long managerId;
    
    private String description;
    
    private Integer status = 1;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// ============================================

package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assessment_projects")
public class AssessmentProject {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "project_name", nullable = false)
    private String projectName;
    
    @Column(name = "project_code", nullable = false, unique = true)
    private String projectCode;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "project_type")
    private String projectType;
    
    @Column(name = "target_department_ids")
    private String targetDepartmentIds;
    
    @Column(name = "target_position_ids")
    private String targetPositionIds;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    private Integer status = 0;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// ============================================

package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assessment_tools")
public class AssessmentTool {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tool_name", nullable = false)
    private String toolName;
    
    @Column(name = "tool_code", nullable = false, unique = true)
    private String toolCode;
    
    @Column(name = "tool_type")
    private String toolType;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "estimated_time")
    private Integer estimatedTime;
    
    @Column(name = "question_count")
    private Integer questionCount;
    
    private Integer status = 1;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// ============================================

package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assessment_tasks")
public class AssessmentTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "project_id", nullable = false)
    private Long projectId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "tool_id", nullable = false)
    private Long toolId;
    
    private Integer status = 0;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "submit_time")
    private LocalDateTime submitTime;
    
    private Double score;
    
    @Column(name = "report_id")
    private Long reportId;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

// ============================================

package com.talent.assessment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "assessment_reports")
public class AssessmentReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "report_code", nullable = false, unique = true)
    private String reportCode;
    
    @Column(name = "project_id", nullable = false)
    private Long projectId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "report_type")
    private String reportType;
    
    @Column(name = "overall_score")
    private Double overallScore;
    
    @Column(name = "dimension_scores", columnDefinition = "JSON")
    private String dimensionScores;
    
    @Column(columnDefinition = "TEXT")
    private String strengths;
    
    @Column(columnDefinition = "TEXT")
    private String weaknesses;
    
    @Column(columnDefinition = "TEXT")
    private String recommendations;
    
    @Column(name = "report_url")
    private String reportUrl;
    
    private Integer status = 0;
    
    @Column(name = "generated_by")
    private Long generatedBy;
    
    @Column(name = "generated_at")
    private LocalDateTime generatedAt;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
