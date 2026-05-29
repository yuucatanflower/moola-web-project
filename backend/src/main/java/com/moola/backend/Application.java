package com.moola.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
// this is the starting point of the backend running this class starts the Spring server on the configured port
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
