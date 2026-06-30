package com.agendafacil.appointments.service;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import com.agendafacil.appointments.repository.AppointmentRepository;
import com.agendafacil.appointments.dto.BookingRequest;
import com.agendafacil.appointments.dto.AppointmentListItem;
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

    public List<Appointment> listByProfessionalEmail(String email) {
        Optional<UUID> profId = repo.findProfessionalIdByEmail(email);
        if (profId.isPresent()) {
            return repo.findByProfessionalId(profId.get()).stream()
                    .sorted(Comparator.comparing(Appointment::getStartAt))
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    public List<AppointmentListItem> listEnrichedByProfessionalEmail(String email) {
        Optional<UUID> profId = repo.findProfessionalIdByEmail(email);
        if (profId.isPresent()) {
            return mapEnrichedRows(repo.findEnrichedByProfessionalId(profId.get()));
        }
        return new ArrayList<>();
    }

    public List<AppointmentListItem> listEnrichedAll() {
        Optional<UUID> profId = repo.findProfessionalIdByEmail("valentina@agendafacil.cl");
        if (profId.isPresent()) {
            return mapEnrichedRows(repo.findEnrichedByProfessionalId(profId.get()));
        }
        return listAll().stream().map(this::toListItem).collect(Collectors.toList());
    }

    private OffsetDateTime toOffsetDateTime(Object value) {
        if (value instanceof java.sql.Timestamp ts) {
            return ts.toInstant().atOffset(java.time.ZoneOffset.UTC);
        }
        if (value instanceof OffsetDateTime odt) {
            return odt;
        }
        if (value instanceof java.time.Instant inst) {
            return inst.atOffset(java.time.ZoneOffset.UTC);
        }
        return OffsetDateTime.now();
    }

    private List<AppointmentListItem> mapEnrichedRows(List<Object[]> rows) {
        List<AppointmentListItem> result = new ArrayList<>();
        for (Object[] row : rows) {
            AppointmentListItem item = new AppointmentListItem();
            item.setId(UUID.fromString((String) row[0]));
            item.setProfessionalId(UUID.fromString((String) row[1]));
            item.setClientId(UUID.fromString((String) row[2]));
            item.setServiceId(UUID.fromString((String) row[3]));
            item.setStartAt(toOffsetDateTime(row[4]));
            item.setEndAt(toOffsetDateTime(row[5]));
            item.setStatus((String) row[6]);
            item.setPaymentStatus((String) row[7]);
            String clientName = row[8] != null ? ((String) row[8]).trim() : "Cliente";
            item.setClientName(clientName.isEmpty() ? "Cliente" : clientName);
            item.setServiceName(row[9] != null ? (String) row[9] : "Cita");
            item.setColorHex(row[10] != null ? (String) row[10] : null);
            result.add(item);
        }
        return result;
    }

    private AppointmentListItem toListItem(Appointment a) {
        AppointmentListItem item = new AppointmentListItem();
        item.setId(a.getId());
        item.setProfessionalId(a.getProfessionalId());
        item.setClientId(a.getClientId());
        item.setServiceId(a.getServiceId());
        item.setStartAt(a.getStartAt());
        item.setEndAt(a.getEndAt());
        item.setStatus(a.getStatus() != null ? a.getStatus().name() : null);
        item.setPaymentStatus(a.getPaymentStatus() != null ? a.getPaymentStatus().name() : null);
        item.setClientName("Cliente");
        item.setServiceName("Cita");
        return item;
    }

    public Optional<UUID> getProfessionalIdByEmail(String email) {
        return repo.findProfessionalIdByEmail(email);
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

    public Map<String, Object> getProfessionalProfile(String username) {
        Optional<UUID> profIdOpt = repo.findProfessionalIdByUsernameSlug(username);
        if (profIdOpt.isEmpty()) {
            try {
                profIdOpt = Optional.of(UUID.fromString(username));
            } catch (IllegalArgumentException e) {
                return null;
            }
        }
        List<Object[]> result = repo.findProfessionalProfileBySlug(username);
        if (result.isEmpty()) {
            // Also try fetching using default if nothing matched
            result = repo.findProfessionalProfileBySlug("valentina-rojas");
            if (result.isEmpty()) return null;
        }
        Object[] row = result.get(0);
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", row[0]);
        profile.put("firstName", row[1]);
        profile.put("lastName", row[2]);
        profile.put("bio", row[3]);
        profile.put("specialty", row[4]);
        profile.put("email", row[5]);
        return profile;
    }

    public List<Map<String, Object>> getServices(String username) {
        Optional<UUID> profIdOpt = repo.findProfessionalIdByUsernameSlug(username);
        if (profIdOpt.isEmpty()) {
            try {
                profIdOpt = Optional.of(UUID.fromString(username));
            } catch (IllegalArgumentException e) {
                // Default fallback to valentina-rojas
                profIdOpt = repo.findProfessionalIdByUsernameSlug("valentina-rojas");
            }
        }
        if (profIdOpt.isEmpty()) {
            return new ArrayList<>();
        }
        UUID profId = profIdOpt.get();
        List<Object[]> servicesRows = repo.findActiveServicesByProfessionalId(profId);
        List<Map<String, Object>> services = new ArrayList<>();
        for (Object[] row : servicesRows) {
            Map<String, Object> s = new HashMap<>();
            s.put("id", row[0]);
            s.put("name", row[1]);
            s.put("description", row[2]);
            s.put("duration", row[3]);
            s.put("price", row[4]);
            s.put("type", row[5]);
            s.put("colorHex", row[6]);
            s.put("iconName", row[7]);
            services.add(s);
        }
        return services;
    }

    public List<String> getAvailability(String username, String date, String serviceId) {
        Optional<UUID> profIdOpt = repo.findProfessionalIdByUsernameSlug(username);
        if (profIdOpt.isEmpty()) {
            try {
                profIdOpt = Optional.of(UUID.fromString(username));
            } catch (IllegalArgumentException e) {
                // Fallback to valentina-rojas
                profIdOpt = repo.findProfessionalIdByUsernameSlug("valentina-rojas");
            }
        }
        if (profIdOpt.isEmpty()) {
            return Collections.emptyList();
        }
        UUID profId = profIdOpt.get();

        // Determine duration
        int durationMinutes = 30;
        if (serviceId != null && !serviceId.isEmpty()) {
            try {
                durationMinutes = repo.findServiceDuration(UUID.fromString(serviceId)).orElse(30);
            } catch (IllegalArgumentException ignored) {}
        }

        // Get schedules and exceptions
        java.time.LocalDate localDate = java.time.LocalDate.parse(date);
        List<Object[]> exceptions = repo.findScheduleExceptionForDate(profId, date);
        String startTimeStr = null;
        String endTimeStr = null;
        boolean hasException = !exceptions.isEmpty();

        if (hasException) {
            Object[] exc = exceptions.get(0);
            if (exc[0] == null) {
                return Collections.emptyList();
            }
            startTimeStr = (String) exc[0];
            endTimeStr = (String) exc[1];
        } else {
            String dayOfWeek = localDate.getDayOfWeek().name();
            List<Object[]> sched = repo.findActiveScheduleForDay(profId, dayOfWeek);
            if (sched.isEmpty()) {
                return Collections.emptyList();
            }
            Object[] row = sched.get(0);
            startTimeStr = (String) row[0];
            endTimeStr = (String) row[1];
        }

        if (startTimeStr == null || endTimeStr == null) {
            return Collections.emptyList();
        }

        java.time.LocalTime workStart = java.time.LocalTime.parse(startTimeStr.substring(0, 5));
        java.time.LocalTime workEnd = java.time.LocalTime.parse(endTimeStr.substring(0, 5));

        List<java.time.LocalTime> candidateTimes = new ArrayList<>();
        java.time.LocalTime current = workStart;
        while (!current.plusMinutes(durationMinutes).isAfter(workEnd) && !current.isAfter(workEnd)) {
            candidateTimes.add(current);
            current = current.plusMinutes(30); // Offer slots starting every 30 minutes
        }

        java.time.ZoneId zone = java.time.ZoneId.of("America/Santiago");
        List<Appointment> dayAppointments = repo.findByProfessionalId(profId).stream()
            .filter(a -> {
                if (a.getStatus() == AppointmentStatus.CANCELLED_BY_CLIENT || 
                    a.getStatus() == AppointmentStatus.CANCELLED_BY_PROFESSIONAL || 
                    a.getStatus() == AppointmentStatus.NO_SHOW) {
                    return false;
                }
                java.time.LocalDate appointmentLocalDate = a.getStartAt().atZoneSameInstant(zone).toLocalDate();
                return appointmentLocalDate.equals(localDate);
            })
            .collect(Collectors.toList());

        List<String> available = new ArrayList<>();
        for (java.time.LocalTime time : candidateTimes) {
            boolean overlaps = false;
            java.time.LocalTime slotStart = time;
            java.time.LocalTime slotEnd = time.plusMinutes(durationMinutes);

            for (Appointment appt : dayAppointments) {
                java.time.LocalTime apptStart = appt.getStartAt().atZoneSameInstant(zone).toLocalTime();
                java.time.LocalTime apptEnd = appt.getEndAt().atZoneSameInstant(zone).toLocalTime();

                if (slotStart.isBefore(apptEnd) && slotEnd.isAfter(apptStart)) {
                    overlaps = true;
                    break;
                }
            }

            if (!overlaps) {
                available.add(String.format("%02d:%02d", time.getHour(), time.getMinute()));
            }
        }

        return available;
    }

    public List<String> getAvailability(String professionalIdStr, String date) {
        return getAvailability(professionalIdStr, date, null);
    }

    @org.springframework.transaction.annotation.Transactional
    public Appointment createBooking(BookingRequest req) {
        UUID profId = repo.findProfessionalIdByUsernameSlug(req.getProfessionalUsername())
            .orElseGet(() -> {
                if (req.getProfessionalId() != null && !req.getProfessionalId().isEmpty()) {
                    try {
                        return UUID.fromString(req.getProfessionalId());
                    } catch (IllegalArgumentException e) {
                        return UUID.fromString("a1b2c3d4-0001-0001-0001-000000000001");
                    }
                }
                // fallback to valentina
                return repo.findProfessionalIdByUsernameSlug("valentina-rojas")
                    .orElse(UUID.fromString("a1b2c3d4-0001-0001-0001-000000000001"));
            });

        UUID serviceId;
        try {
            serviceId = UUID.fromString(req.getServiceId());
        } catch (Exception e) {
            serviceId = UUID.fromString("b1c2d3e4-0002-0002-0002-000000000001");
        }

        String email = req.getClientEmail().trim().toLowerCase();
        UUID clientId = repo.findClientIdByEmailAndProfessionalId(profId, email)
            .orElseGet(() -> {
                UUID newClientId = UUID.randomUUID();
                String fullName = req.getClientName();
                String firstName = fullName;
                String lastName = "";
                if (fullName.contains(" ")) {
                    String[] parts = fullName.split(" ", 2);
                    firstName = parts[0];
                    lastName = parts[1];
                }
                repo.insertClient(newClientId, profId, firstName, lastName, email, req.getPhone());
                return newClientId;
            });

        java.time.ZoneId zone = java.time.ZoneId.of("America/Santiago");
        java.time.LocalDate localDate = java.time.LocalDate.parse(req.getDate());
        java.time.LocalTime localTime = java.time.LocalTime.parse(req.getTime());
        java.time.ZonedDateTime zonedDateTime = java.time.ZonedDateTime.of(localDate, localTime, zone);
        OffsetDateTime startAt = zonedDateTime.toOffsetDateTime();

        int durationMinutes = repo.findServiceDuration(serviceId).orElse(60);
        OffsetDateTime endAt = startAt.plusMinutes(durationMinutes);

        Appointment a = new Appointment();
        a.setProfessionalId(profId);
        a.setClientId(clientId);
        a.setServiceId(serviceId);
        a.setStartAt(startAt);
        a.setEndAt(endAt);
        a.setStatus(com.agendafacil.appointments.model.AppointmentStatus.CONFIRMED);
        a.setPaymentStatus(com.agendafacil.appointments.model.PaymentStatus.UNPAID);

        return repo.save(a);
    }

    public void saveInitial(List<Appointment> list) {
        repo.saveAll(list);
    }

    public List<Map<String, Object>> getSchedulesByProfessionalEmail(String email) {
        Optional<UUID> profIdOpt = repo.findProfessionalIdByEmail(email);
        if (profIdOpt.isEmpty()) {
            return new ArrayList<>();
        }
        UUID profId = profIdOpt.get();
        List<Object[]> rows = repo.findSchedulesByProfessionalId(profId);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("dayOfWeek", row[1]);
            map.put("startTime", row[2] != null ? row[2].toString().substring(0, 5) : "09:00");
            map.put("endTime", row[3] != null ? row[3].toString().substring(0, 5) : "18:00");
            map.put("isActive", row[4]);
            list.add(map);
        }
        return list;
    }

    @org.springframework.transaction.annotation.Transactional
    public void saveSchedulesByProfessionalEmail(List<Map<String, Object>> schedulesList, String email) {
        Optional<UUID> profIdOpt = repo.findProfessionalIdByEmail(email);
        if (profIdOpt.isEmpty()) {
            return;
        }
        UUID profId = profIdOpt.get();
        for (Map<String, Object> item : schedulesList) {
            String dayOfWeek = (String) item.get("dayOfWeek");
            String startTime = (String) item.get("startTime");
            String endTime = (String) item.get("endTime");
            boolean isActive = (boolean) item.get("isActive");
            repo.upsertSchedule(profId, dayOfWeek, startTime, endTime, isActive);
        }
    }
}
