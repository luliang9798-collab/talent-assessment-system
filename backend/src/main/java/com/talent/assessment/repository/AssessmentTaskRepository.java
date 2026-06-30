package com.talent.assessment.repository;

import com.talent.assessment.entity.AssessmentTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentTaskRepository extends JpaRepository<AssessmentTask, Long> {
    List<AssessmentTask> findByProjectId(Long projectId);
    List<AssessmentTask> findByUserId(Long userId);
    List<AssessmentTask> findByProjectIdAndUserId(Long projectId, Long userId);
    Optional<AssessmentTask> findByProjectIdAndUserIdAndToolId(Long projectId, Long userId, Long toolId);
}
