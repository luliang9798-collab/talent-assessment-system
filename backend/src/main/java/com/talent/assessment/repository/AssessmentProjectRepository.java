package com.talent.assessment.repository;

import com.talent.assessment.entity.AssessmentProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentProjectRepository extends JpaRepository<AssessmentProject, Long> {
    List<AssessmentProject> findByStatus(Integer status);
    List<AssessmentProject> findByCreatedBy(Long createdBy);
}
