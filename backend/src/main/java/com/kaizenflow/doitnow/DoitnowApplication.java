package com.kaizenflow.doitnow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Doitnow application.
 * <p>
 * This class bootstraps the Spring Boot application, initializing the Spring context
 * and starting the embedded web server.
 * </p>
 */
@SpringBootApplication
public class DoitnowApplication {

	/**
	 * The main method that launches the application.
	 *
	 * @param args Command line arguments passed to the application.
	 */
	public static void main(String[] args) {
		SpringApplication.run(DoitnowApplication.class, args);
	}

}
