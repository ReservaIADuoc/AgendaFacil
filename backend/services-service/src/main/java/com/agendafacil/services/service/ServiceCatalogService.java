package com.agendafacil.services.service;

import com.agendafacil.services.model.ServiceItem;
import java.util.Collection;

public interface ServiceCatalogService {
    Collection<ServiceItem> findAll();
    ServiceItem findById(Long id);
    ServiceItem save(ServiceItem item);
    ServiceItem update(Long id, ServiceItem changes);
    void deleteById(Long id);
}
