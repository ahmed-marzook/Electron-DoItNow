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

/**
 * Service class containing business logic for managing Todos.
 * <p>
 * Handles operations such as creating, retrieving, updating, and deleting Todos,
 * acting as an intermediary between the controller and the repository.
 * </p>
 */
@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    /**
     * Retrieves all Todos.
     *
     * @return A list of {@link TodoResponse} objects representing all Todos.
     */
    @Transactional(readOnly = true)
    public List<TodoResponse> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single Todo by its ID.
     *
     * @param id The ID of the Todo to retrieve.
     * @return The {@link TodoResponse} object for the requested Todo.
     * @throws TodoNotFoundException if no Todo with the given ID is found.
     */
    @Transactional(readOnly = true)
    public TodoResponse getTodoById(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));
        return TodoResponse.fromEntity(todo);
    }

    /**
     * Retrieves Todos filtered by their completion status.
     *
     * @param completed The completion status to filter by.
     * @return A list of {@link TodoResponse} objects matching the criteria.
     */
    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByCompleted(Boolean completed) {
        return todoRepository.findByCompleted(completed).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves Todos filtered by their priority.
     *
     * @param priority The priority to filter by.
     * @return A list of {@link TodoResponse} objects matching the criteria.
     */
    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByPriority(String priority) {
        return todoRepository.findByPriority(priority).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves Todos with a due date within a specified range.
     *
     * @param start The start of the date range (inclusive).
     * @param end   The end of the date range (inclusive).
     * @return A list of {@link TodoResponse} objects falling within the date range.
     */
    @Transactional(readOnly = true)
    public List<TodoResponse> getTodosByDueDateRange(OffsetDateTime start, OffsetDateTime end) {
        return todoRepository.findByDueDateBetween(start, end).stream()
                .map(TodoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new Todo.
     *
     * @param request The {@link TodoRequest} object containing the Todo details.
     * @return The created {@link TodoResponse} object.
     */
    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = new Todo();
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.getCompleted() != null ? request.getCompleted() : false);
        todo.setPriority(request.getPriority() != null ? request.getPriority() : "medium");
        todo.setDueDate(request.getDueDate());

        Todo savedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(savedTodo);
    }

    /**
     * Updates an existing Todo.
     *
     * @param id      The ID of the Todo to update.
     * @param request The {@link TodoRequest} object containing the updated details.
     * @return The updated {@link TodoResponse} object.
     * @throws TodoNotFoundException if the Todo to update is not found.
     */
    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));

        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.getCompleted());
        todo.setPriority(request.getPriority());
        todo.setDueDate(request.getDueDate());

        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(updatedTodo);
    }

    /**
     * Toggles the completion status of a Todo.
     *
     * @param id The ID of the Todo to toggle.
     * @return The updated {@link TodoResponse} object.
     * @throws TodoNotFoundException if the Todo is not found.
     */
    @Transactional
    public TodoResponse toggleTodoCompleted(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new TodoNotFoundException(id));

        todo.setCompleted(!todo.getCompleted());
        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.fromEntity(updatedTodo);
    }

    /**
     * Deletes a Todo by its ID.
     *
     * @param id The ID of the Todo to delete.
     * @throws TodoNotFoundException if the Todo to delete is not found.
     */
    @Transactional
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new TodoNotFoundException(id);
        }
        todoRepository.deleteById(id);
    }
}
