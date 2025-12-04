package com.kaizenflow.doitnow.exception;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Standardized error response object returned by the API when an exception occurs.
 */
@Data
@AllArgsConstructor
public class ErrorResponse {

    /**
     * The timestamp when the error occurred.
     */
    private OffsetDateTime timestamp;

    /**
     * The HTTP status code associated with the error.
     */
    private int status;

    /**
     * A short description of the error (e.g., "Not Found", "Bad Request").
     */
    private String error;

    /**
     * A detailed message explaining the error.
     */
    private String message;

    /**
     * The URI path where the error occurred.
     */
    private String path;
}
