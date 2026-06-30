package com.agendafacil.appointments.dto;

import java.util.List;

public class AvailabilityResponse {
    private String date;
    private List<String> availableTimes; // HH:mm

    public AvailabilityResponse() {}

    public AvailabilityResponse(String date, List<String> availableTimes) {
        this.date = date;
        this.availableTimes = availableTimes;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public List<String> getAvailableTimes() { return availableTimes; }
    public void setAvailableTimes(List<String> availableTimes) { this.availableTimes = availableTimes; }
}
