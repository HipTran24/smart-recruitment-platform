package com.recruitment.app.recovery;

import com.recruitment.app.ApplicationTests;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import static org.junit.jupiter.api.Assertions.*;

class KpiSourceUpgradeTests {
    @Test
    void upgradesV010RowsWithoutInventingAttribution() {
        if (!ApplicationTests.MYSQL.isRunning()) ApplicationTests.MYSQL.start();
        String original = ApplicationTests.MYSQL.getJdbcUrl();
        String root = original.substring(0, original.lastIndexOf('/')+1);
        String password = ApplicationTests.MYSQL.getPassword();
        var admin = new JdbcTemplate(new DriverManagerDataSource(root,"root",password));
        admin.execute("CREATE DATABASE kpi_v010_upgrade_test");
        String url = root + "kpi_v010_upgrade_test";
        try {
            Flyway.configure().dataSource(url,"root",password).target("010").load().migrate();
            RecoveryDatabaseTest fixture = new RecoveryDatabaseTest() {};
            fixture.jdbc = new JdbcTemplate(new DriverManagerDataSource(url,"root",password));
            // Fixture helpers use LAST_INSERT_ID, so bind one connection explicitly.
            var manager = new org.springframework.jdbc.datasource.DataSourceTransactionManager(fixture.jdbc.getDataSource());
            var transaction = new org.springframework.transaction.support.TransactionTemplate(manager);
            Long application = transaction.execute(status -> fixture.application(fixture.job(fixture.createUser()),fixture.profile(fixture.createUser())));
            Flyway.configure().dataSource(url,"root",password).load().migrate();
            assertEquals("UNKNOWN",fixture.jdbc.queryForObject("SELECT source FROM job_applications WHERE id=?",String.class,application));
            assertEquals("SUBMITTED",fixture.jdbc.queryForObject("SELECT status FROM job_applications WHERE id=?",String.class,application));
        } finally { admin.execute("DROP DATABASE kpi_v010_upgrade_test"); }
    }
}
