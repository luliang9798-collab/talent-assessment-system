package com.talent.assessment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TalentAssessmentApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(TalentAssessmentApplication.class, args);
        System.out.println("====================================");
        System.out.println("人才测评系统启动成功！");
        System.out.println("访问地址: http://localhost:8080/api");
        System.out.println("Swagger文档: http://localhost:8080/api/swagger-ui.html");
        System.out.println("====================================");
    }
}
