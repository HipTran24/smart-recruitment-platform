package com.recruitment.app;

import com.recruitment.app.modules.applications.api.dto.ApplicationDtos.CreateEvaluationRequest;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationEvaluation;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EvaluationScoreValidationTests {

    private ApplicationEvaluation evaluation(Integer score) {
        return new ApplicationEvaluation(
                1L, 2L, score,
                ApplicationEvaluation.Recommendation.YES,
                null, null, null, null
        );
    }

    @Test
    void entityRejectsOutOfRangeScoresInsteadOfClamping() {
        assertThrows(IllegalArgumentException.class, () -> evaluation(-1));
        assertThrows(IllegalArgumentException.class, () -> evaluation(101));
    }

    @Test
    void validScoresArePreserved() {
        for (int score : new int[]{0, 50, 100}) {
            assertEquals(Integer.valueOf(score), evaluation(score).getScore());
        }
    }

    @Test
    void dtoRejectsOutOfRangeScoresAndAcceptsBoundaries() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();

            for (int score : new int[]{-1, 101}) {
                var request = new CreateEvaluationRequest(
                        score, "YES", null, null, null, null
                );
                assertFalse(validator.validate(request).isEmpty());
            }

            for (int score : new int[]{0, 100}) {
                var request = new CreateEvaluationRequest(
                        score, "YES", null, null, null, null
                );
                assertTrue(validator.validate(request).isEmpty());
            }
        }
    }
}