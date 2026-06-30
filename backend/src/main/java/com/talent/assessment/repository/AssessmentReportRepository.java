package com.talent.assessment.repository;

import com.talent.assessment.entity.AssessmentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentReportRepository extends JpaRepository<AssessmentReport, Long> {
    List<AssessmentReport> findByProjectId(Long projectId);
    List<AssessmentReport> findByUserId(Long userId);
    Optional<AssessmentReport> findByReportCode(String reportCode);
}
