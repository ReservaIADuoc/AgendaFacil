package com.agendafacil.appointments.config;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.agendafacil.appointments.model.Appointment;
import com.agendafacil.appointments.model.AppointmentStatus;
import com.agendafacil.appointments.model.PaymentStatus;
import com.agendafacil.appointments.service.AppointmentService;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner load(AppointmentService service) {
        return args -> {
            // Seed two realistic appointments aligned with database schema UUIDs in /database/schema.sql
            Appointment past = new Appointment();
            past.setId(UUID.fromString("d1e2f3a4-0004-0004-0004-000000000001"));
            past.setProfessionalId(UUID.fromString("a1b2c3d4-0001-0001-0001-000000000001"));
            past.setClientId(UUID.fromString("c1d2e3f4-0003-0003-0003-000000000001"));
            past.setServiceId(UUID.fromString("b1c2d3e4-0002-0002-0002-000000000001"));
            past.setStartAt(OffsetDateTime.now().minusDays(30));
            past.setEndAt(OffsetDateTime.now().minusDays(30).plusHours(1));
            past.setStatus(AppointmentStatus.COMPLETED);
            past.setPaymentStatus(PaymentStatus.PAID);

            Appointment future = new Appointment();
            future.setId(UUID.fromString("d1e2f3a4-0004-0004-0004-000000000006"));
            future.setProfessionalId(UUID.fromString("a1b2c3d4-0001-0001-0001-000000000001"));
            future.setClientId(UUID.fromString("c1d2e3f4-0003-0003-0003-000000000001"));
            future.setServiceId(UUID.fromString("b1c2d3e4-0002-0002-0002-000000000001"));
            future.setStartAt(OffsetDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
            future.setEndAt(future.getStartAt().plusHours(1));
            future.setStatus(AppointmentStatus.CONFIRMED);
            future.setPaymentStatus(PaymentStatus.UNPAID);

            try {
                service.saveInitial(Arrays.asList(past, future));
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                // datos de seed ya cargados en un arranque previo, ignorar
            }
        };
    }
}
