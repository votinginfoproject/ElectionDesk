<?php namespace Consumer\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ListenCommand extends Command {

    private $processes = [];
    private $output = [];

    protected function configure()
    {
        $this
            ->setName('listen')
            ->setDescription('Starts the consumer listener to processs consumers')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        declare(ticks = 1);

        $this->output = $output;

        $this->initializeSignalHandler();
        $this->prepareConsumers();

        while (true) {
            foreach ($this->processes as $name => $process) {
                $processOutput = $process->getIncrementalOutput();

                if ($processOutput !== false) {
                    $output->write('<info>'. $name .':</info> ' . $processOutput);
                }

                // Start the process again if necessary
                if (!$process->isRunning()) {
                    $output->writeln('<info>'. $name .':</info> Started again');
                    $process->start();
                }

                sleep(1);
            }
        }
    }

    private function initializeSignalHandler() {
        $that = $this;

        // Stop all processes if we receive a SIGINT
        pcntl_signal(SIGINT, function ($signal) use ($that) {
            $that->output->writeln('<error>Received SIGINIT</error>');

            foreach ($that->processes as $name => $process) {
                $that->output->writeln('<error>'. $name .' Stopped</error>');
                unset($that->processes[$name]); // Remove from list
                $process->stop(5); // Stop process
            }

            exit(0);
        });
    }

    private function prepareConsumers() {
        // Get all active filters
        $filters = \Consumer\Model\Filter::where('active', 1)->get();

        // Loop through all active consumers
        foreach (explode(',', CONSUMERS) as $consumerName) {
            $consumerName = ucfirst(strtolower($consumerName));

            foreach ($filters as $filter) {
                $this->processes[$consumerName . ' - Filter ' . $filter->id] = new \Symfony\Component\Process\Process('./consume work ' . $consumerName . ' ' . $filter->id);
                $this->processes[$consumerName . ' - Filter ' . $filter->id]->start();
            }

            $this->output->writeln('<info>'. $consumerName .':</info> Started');
        }
    }

}