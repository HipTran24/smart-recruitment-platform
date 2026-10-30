package com.recruitment.app.modules.applications.application.port.out;

import com.recruitment.app.modules.applications.domain.model.KpiQuery;
import com.recruitment.app.modules.applications.domain.model.KpiReport;

public interface KpiStore {
    boolean jobExists(long id);
    KpiReport aggregate(KpiQuery query);
}
