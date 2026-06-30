package com.agendafacil.auth.model;

/**
 * usuario simple para login/registro.
 * nota: la contraseña se guarda en texto plano porque esto es una base
 * funcional de ejemplo, no producción. antes de un despliegue real hay
 * que hashearla (bcrypt) y usar jwt en vez del token aleatorio actual.
 */
public class User {

    private Long id;
    private String email;
    private String password;
    private String name;
    private String usernameSlug;

    public User() {
    }

    public User(Long id, String email, String password, String name) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        if (name != null) {
            this.usernameSlug = name.toLowerCase().trim().replaceAll("[^a-z0-9-]", "");
        }
    }

    public User(Long id, String email, String password, String name, String usernameSlug) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.usernameSlug = usernameSlug;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUsernameSlug() {
        return usernameSlug;
    }

    public void setUsernameSlug(String usernameSlug) {
        this.usernameSlug = usernameSlug;
    }

    private String avatarUrl;

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
