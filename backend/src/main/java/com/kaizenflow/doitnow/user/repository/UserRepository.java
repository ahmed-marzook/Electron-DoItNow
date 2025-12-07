package com.kaizenflow.doitnow.user.repository;

import com.kaizenflow.doitnow.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
