package com.talent.assessment.repository;

import com.talent.assessment.entity.AssessmentTool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentToolRepository extends JpaRepository<AssessmentTool, Long> {
    List<AssessmentTool> findByStatus(Integer status);
    Optional<AssessmentTool> findByToolCode(String toolCode);
}
