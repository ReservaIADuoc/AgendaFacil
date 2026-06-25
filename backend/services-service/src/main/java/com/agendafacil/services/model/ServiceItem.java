package com.agendafacil.services.model;

import java.math.BigDecimal;

/**
 * Representa un servicio ofrecido por un proveedor (ej: "Corte de pelo").
 * Por ahora se mantiene en memoria; cuando se conecte a una base de datos
 * basta con agregar las anotaciones JPA (@Entity, @Id, etc.) aquí.
 */
public class ServiceItem {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;

    public ServiceItem() {
    }

    public ServiceItem(Long id, String name, String description, BigDecimal price, Integer durationMinutes) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.durationMinutes = durationMinutes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
