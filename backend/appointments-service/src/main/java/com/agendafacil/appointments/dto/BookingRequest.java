package com.agendafacil.appointments.dto;

public class BookingRequest {
    private String professionalUsername;
    private String professionalId; // UUID string preferred
    private String serviceId;
    private String clientName;
    private String clientEmail;
    private String phone;
    private String date; // yyyy-MM-dd
    private String time; // HH:mm

    public BookingRequest() {}
    public String getProfessionalUsername() { return professionalUsername; }
    public void setProfessionalUsername(String professionalUsername) { this.professionalUsername = professionalUsername; }
    public String getProfessionalId() { return professionalId; }
    public void setProfessionalId(String professionalId) { this.professionalId = professionalId; }
    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }
    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
