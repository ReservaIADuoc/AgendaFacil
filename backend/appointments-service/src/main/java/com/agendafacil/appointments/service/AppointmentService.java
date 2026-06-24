package com.agendafacil.appointments.service;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import com.agendafacil.appointments.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository repo;

    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }

    public List<Appointment> listAll() {
        return repo.findAll().stream()
                .sorted(Comparator.comparing(Appointment::getStartAt))
                .collect(Collectors.toList());
    }

    public Optional<Appointment> get(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            return repo.findById(uuid);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public Appointment create(Appointment a) {
        if (a.getId() == null) a.setId(UUID.randomUUID());
        return repo.save(a);
    }

    public Optional<Appointment> update(String id, Appointment a) {
        try {
            UUID uuid = UUID.fromString(id);
            return repo.findById(uuid).map(existing -> {
                existing.setStartAt(a.getStartAt());
                existing.setEndAt(a.getEndAt());
                existing.setStatus(a.getStatus());
                existing.setPaymentStatus(a.getPaymentStatus());
                existing.setClientNotes(a.getClientNotes());
                existing.setProfessionalNotes(a.getProfessionalNotes());
                existing.setMeetingUrl(a.getMeetingUrl());
                existing.setGoogleEventId(a.getGoogleEventId());
                return repo.save(existing);
            });
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    public void delete(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            repo.deleteById(uuid);
        } catch (IllegalArgumentException ignored) {
        }
    }

    // Simple availability: check overlapping appointments for a professional between start and end
    public List<String> getAvailability(String professionalIdStr, String date) {
        // Keep compatibility with previous API: professionalIdStr may be username or UUID.
        // For strict schema compliance we expect UUID string of professional_id.
        List<String> base = Arrays.asList("09:00","09:30","10:00","11:00","14:00","15:30","16:00");
        // Very simple: if professionalId is UUID, check overlaps for the whole day
        try {
            UUID profId = UUID.fromString(professionalIdStr);
            OffsetDateTime dayStart = OffsetDateTime.parse(date + "T00:00:00Z");
            OffsetDateTime dayEnd = OffsetDateTime.parse(date + "T23:59:59Z");
            List<Appointment> overlaps = repo.findOverlapping(profId, dayStart, dayEnd, Arrays.asList(AppointmentStatus.CANCELLED_BY_CLIENT, AppointmentStatus.CANCELLED_BY_PROFESSIONAL, AppointmentStatus.NO_SHOW));
            Set<String> occupied = overlaps.stream().map(a -> a.getStartAt().toLocalTime().toString()).collect(Collectors.toSet());
            return base.stream().filter(t -> !occupied.contains(t)).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return base; // if username provided, return base mocked list
        }
    }

    public List<Map<String,Object>> getServices(String username) {
        // keep mocked services for now
        List<Map<String,Object>> services = new ArrayList<>();
        Map<String,Object> s1 = new HashMap<>();
        s1.put("id","b1c2d3e4-0002-0002-0002-000000000001"); s1.put("name","Consulta General"); s1.put("duration",60); s1.put("type","VIDEO");
        Map<String,Object> s2 = new HashMap<>();
        s2.put("id","b1c2d3e4-0002-0002-0002-000000000002"); s2.put("name","Terapia de Pareja"); s2.put("duration",90); s2.put("type","PRESENCIAL");
        services.add(s1); services.add(s2);
        return services;
    }

    // For data loading
    public void saveInitial(List<Appointment> list) {
        repo.saveAll(list);
    }
}
