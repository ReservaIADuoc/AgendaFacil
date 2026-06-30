package com.agendafacil.clients.service;

import com.agendafacil.clients.model.ClientItem;
import java.util.Collection;

public interface ClientCatalogService {
    Collection<ClientItem> findAll();
    ClientItem findById(Long id);
    ClientItem save(ClientItem item);
    ClientItem update(Long id, ClientItem changes);
    void deleteById(Long id);
}
