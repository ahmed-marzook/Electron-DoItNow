package com.kaizenflow.doitnow.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.kaizenflow.doitnow.todo.dto.TodoRequest;
import com.kaizenflow.doitnow.todo.dto.TodoResponse;
import com.kaizenflow.doitnow.todo.entity.Todo;
import com.kaizenflow.doitnow.todo.mapper.TodoMapper;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TodoMapperTest {

    @Autowired
    private TodoMapper todoMapper;

    @Test
    void toResponse() {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setEntityId(100L);
        todo.setTitle("Test Title");
        todo.setDescription("Test Description");
        todo.setCompleted(true);
        todo.setPriority("high");
        todo.setDueDate(OffsetDateTime.now());
        todo.setCreatedAt(OffsetDateTime.now());
        todo.setUpdatedAt(OffsetDateTime.now());

        TodoResponse response = todoMapper.toResponse(todo);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(todo.getId());
        assertThat(response.getTitle()).isEqualTo(todo.getTitle());
        assertThat(response.getDescription()).isEqualTo(todo.getDescription());
        assertThat(response.getCompleted()).isEqualTo(todo.getCompleted());
        assertThat(response.getPriority()).isEqualTo(todo.getPriority());
        assertThat(response.getDueDate()).isEqualTo(todo.getDueDate());
        assertThat(response.getCreatedAt()).isEqualTo(todo.getCreatedAt());
        assertThat(response.getUpdatedAt()).isEqualTo(todo.getUpdatedAt());
    }

    @Test
    void toEntity() {
        TodoRequest request = new TodoRequest();
        request.setEntityId(200L);
        request.setTitle("New Todo");
        request.setDescription("New Description");
        request.setCompleted(false);
        request.setPriority("low");
        request.setDueDate(OffsetDateTime.now());

        Todo todo = todoMapper.toEntity(request);

        assertThat(todo).isNotNull();
        assertThat(todo.getEntityId()).isEqualTo(request.getEntityId());
        assertThat(todo.getTitle()).isEqualTo(request.getTitle());
        assertThat(todo.getDescription()).isEqualTo(request.getDescription());
        assertThat(todo.getCompleted()).isEqualTo(request.getCompleted());
        assertThat(todo.getPriority()).isEqualTo(request.getPriority());
        assertThat(todo.getDueDate()).isEqualTo(request.getDueDate());

        // Ignored fields
        assertThat(todo.getId()).isNull();
        assertThat(todo.getCreatedAt()).isNull();
        assertThat(todo.getUpdatedAt()).isNull();
    }

    @Test
    void updateEntityFromRequest() {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setEntityId(100L);
        todo.setTitle("Old Title");
        todo.setDescription("Old Description");
        todo.setCompleted(false);
        todo.setPriority("medium");

        TodoRequest request = new TodoRequest();
        request.setEntityId(999L); // Should be ignored
        request.setTitle("Updated Title");
        request.setDescription("Updated Description");
        request.setCompleted(true);
        request.setPriority("high");

        todoMapper.updateEntityFromRequest(request, todo);

        assertThat(todo.getTitle()).isEqualTo(request.getTitle());
        assertThat(todo.getDescription()).isEqualTo(request.getDescription());
        assertThat(todo.getCompleted()).isEqualTo(request.getCompleted());
        assertThat(todo.getPriority()).isEqualTo(request.getPriority());

        // Fields that should not change
        assertThat(todo.getId()).isEqualTo(1L);
        assertThat(todo.getEntityId()).isEqualTo(100L);
    }

    @Test
    void updateEntityFromRequest_nullValues() {
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setEntityId(100L);
        todo.setTitle("Old Title");
        todo.setDescription("Old Description");
        todo.setCompleted(false);
        todo.setPriority("medium");

        TodoRequest request = new TodoRequest();
        request.setEntityId(100L);
        request.setTitle(null);

        todoMapper.updateEntityFromRequest(request, todo);

        assertThat(todo.getTitle()).isNull();
    }
}
