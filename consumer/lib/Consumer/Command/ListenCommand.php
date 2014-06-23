<?php namespace Consumer\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

class ListenCommand extends Command {

    protected function configure()
    {
        $this
            ->setName('listen')
            ->setDescription('Starts the consumer listener to processs consumers')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $processes = array();

        foreach (explode(',', CONSUMERS) as $consumerName) {
            $consumerName = ucfirst(strtolower($consumerName));

            $processes[$consumerName] = new \Symfony\Component\Process\Process('./consume consume ' . $consumerName);
            $processes[$consumerName]->start();

            $output->writeln('Started ' . $consumerName);
        }

        while (true) {
            foreach ($processes as $name => $process) {
                $processOutput = $process->getIncrementalOutput();

                if ($processOutput !== false) {
                    $output->write('<info>'. $name .':</info> ' . $processOutput);
                }

                // Restart process if necessary
                if (!$process->isRunning()) {
                    $output->writeln('<info>'. $name .':</info> Restarted');
                    $process->start();
                }

                sleep(1);
            }
        }
    }

}