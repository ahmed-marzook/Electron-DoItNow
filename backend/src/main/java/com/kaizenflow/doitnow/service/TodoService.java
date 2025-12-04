package com.kaizenflow.doitnow.service;

import com.kaizenflow.doitnow.dto.TodoRequest;
import com.kaizenflow.doitnow.dto.TodoResponse;
import com.kaizenflow.doitnow.entity.Todo;
import com.kaizenflow.doitnow.exception.TodoNotFoundException;
import com.kaizenflow.doitnow.mapper.TodoMapper;
import com.kaizenflow.doitnow.repository.TodoRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;
    private final TodoMapper todoMapper;

    @Transactional(readOnly = true)
    public List<TodoResponse> getAllTodos() {
        return todoRepository.findAll().stream().map(todoMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TodoResponse getTodoById(Long id) {
        Todo todo = todoRepository.findByEntityId(id).orElseThrow(() -> new TodoNotFoundException(id));
        return todoMapper.toResponse(todo);
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByCompleted(Boolean completed) {
        return todoRepository.findByCompleted(completed).stream()
                .map(todoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByPriority(String priority) {
        return todoRepository.findByPriority(priority).stream()
                .map(todoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByDueDateRange(OffsetDateTime start, OffsetDateTime end) {
        return todoRepository.findByDueDateBetween(start, end).stream()
                .map(todoMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = todoMapper.toEntity(request);
        if (todo.getCompleted() == null) {
            todo.setCompleted(false);
        }
        if (todo.getPriority() == null) {
            todo.setPriority("medium");
        }

        Todo savedTodo = todoRepository.save(todo);
        return todoMapper.toResponse(savedTodo);
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo =
                todoRepository.findByEntityId(request.getEntityId()).orElseThrow(() -> new TodoNotFoundException(id));

        todoMapper.updateEntityFromRequest(request, todo);

        Todo updatedTodo = todoRepository.save(todo);
        return todoMapper.toResponse(updatedTodo);
    }

    @Transactional
    public TodoResponse toggleTodoCompleted(Long id) {
        Todo todo = todoRepository.findByEntityId(id).orElseThrow(() -> new TodoNotFoundException(id));

        todo.setCompleted(!todo.getCompleted());
        Todo updatedTodo = todoRepository.save(todo);
        return todoMapper.toResponse(updatedTodo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.findByEntityId(id).orElseThrow(() -> new TodoNotFoundException(id));
        todoRepository.deleteById(id);
    }
}
