package com.kaizenflow.doitnow.exception;

/**
 * Exception thrown when a requested Todo item cannot be found.
 */
public class TodoNotFoundException extends RuntimeException {

    /**
     * Constructs a new TodoNotFoundException with the specified detail message.
     *
     * @param message The detail message.
     */
    public TodoNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new TodoNotFoundException for a specific Todo ID.
     *
     * @param id The ID of the Todo that was not found.
     */
    public TodoNotFoundException(Long id) {
        super("Todo not found with id: " + id);
    }
}
