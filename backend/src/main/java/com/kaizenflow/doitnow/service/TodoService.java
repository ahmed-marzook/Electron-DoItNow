package com.kaizenflow.doitnow.service;

import com.kaizenflow.doitnow.dto.TodoRequest;
import com.kaizenflow.doitnow.dto.TodoResponse;
import com.kaizenflow.doitnow.entity.Todo;
import com.kaizenflow.doitnow.exception.TodoNotFoundException;
import com.kaizenflow.doitnow.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    @Transactional(readOnly = true)
    public List<TodoResponse> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TodoResponse getTodoById(Long id) {
        Todo todo = todoRepository.findByEntityId(id)
                .orElseThrow(() -> new TodoNotFoundException(id));
        return TodoResponse.fromEntity(todo);
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByCompleted(Boolean completed) {
        return todoRepository.findByCompleted(completed).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByPriority(String priority) {
        return todoRepository.findByPriority(priority).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByDueDateRange(OffsetDateTime start, OffsetDateTime end) {
        return todoRepository.findByDueDateBetween(start, end).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = new Todo();
        todo.setEntityId(request.getEntityId());
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.getCompleted() != null ? request.getCompleted() : false);
        todo.setPriority(request.getPriority() != null ? request.getPriority() : "medium");
        todo.setDueDate(request.getDueDate());

        Todo savedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(savedTodo);
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findByEntityId(request.getEntityId())
                .orElseThrow(() -> new TodoNotFoundException(id));

        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.getCompleted());
        todo.setPriority(request.getPriority());
        todo.setDueDate(request.getDueDate());

        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(updatedTodo);
    }

    @Transactional
    public TodoResponse toggleTodoCompleted(Long id) {
        Todo todo = todoRepository.findByEntityId(id)
                .orElseThrow(() -> new TodoNotFoundException(id));

        todo.setCompleted(!todo.getCompleted());
        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(updatedTodo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.findByEntityId(id)
                .orElseThrow(() -> new TodoNotFoundException(id));
        todoRepository.deleteById(id);
    }
}
