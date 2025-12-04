package com.kaizenflow.doitnow.dto;

import com.kaizenflow.doitnow.entity.Todo;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class TodoResponse {

    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;
    private OffsetDateTime dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
