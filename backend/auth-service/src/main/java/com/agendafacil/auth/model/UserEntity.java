package com.agendafacil.auth.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "professionals")
public class UserEntity {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "email", length = 255, nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", length = 255, nullable = false)
    private String passwordHash;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "username_slug", length = 100, nullable = false, unique = true)
    private String usernameSlug;

    @Column(name = "bio", columnDefinition = "text")
    private String bio;

    @Column(name = "avatar_key", columnDefinition = "text")
    private String avatarKey;

    @Column(name = "specialty", length = 200)
    private String specialty;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "plan_type", nullable = false, columnDefinition = "plan_type")
    private PlanType planType = PlanType.FREE;

    @Column(name = "timezone", length = 100, nullable = false)
    private String timezone = "America/Santiago";

    @Column(name = "is_onboarded", nullable = false)
    private Boolean isOnboarded = false;

    @Column(name = "cancellation_policy_hours", nullable = false)
    private Integer cancellationPolicyHours = 24;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public UserEntity() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (usernameSlug == null) {
            String seed = (firstName != null ? firstName : "") + "-" + (lastName != null ? lastName : "");
            usernameSlug = seed.toLowerCase().replaceAll("[^a-z0-9-]", "");
            if (usernameSlug.isEmpty()) {
                usernameSlug = UUID.randomUUID().toString().substring(0, 8);
            }
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUsernameSlug() {
        return usernameSlug;
    }

    public void setUsernameSlug(String usernameSlug) {
        this.usernameSlug = usernameSlug;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarKey() {
        return avatarKey;
    }

    public void setAvatarKey(String avatarKey) {
        this.avatarKey = avatarKey;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public PlanType getPlanType() {
        return planType;
    }

    public void setPlanType(PlanType planType) {
        this.planType = planType;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public Boolean getIsOnboarded() {
        return isOnboarded;
    }

    public void setIsOnboarded(Boolean onboarded) {
        isOnboarded = onboarded;
    }

    public Integer getCancellationPolicyHours() {
        return cancellationPolicyHours;
    }

    public void setCancellationPolicyHours(Integer cancellationPolicyHours) {
        this.cancellationPolicyHours = cancellationPolicyHours;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
